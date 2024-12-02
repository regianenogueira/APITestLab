const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json'); // Remova 'api/' se estiver na mesma pasta
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Middleware para validações
server.use(jsonServer.rewriter({
  '/api/*': '/$1',
}));

server.use(jsonServer.bodyParser);

// Validação de criação de usuário
server.post('/users', (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório!' });
  }

  const existingUser = router.db.get('users').find({ email }).value();
  if (existingUser) {
    return res.status(400).json({ error: 'Email já está em uso!' });
  }

  next();
});

// Validação de atualização de usuário
server.put('/users/:id', (req, res, next) => {
  const { id } = req.params;
  const { email } = req.body;

  const user = router.db.get('users').find({ id: parseInt(id) }).value();
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado!' });
  }

  if (email) {
    const existingUser = router.db.get('users').find({ email }).value();
    if (existingUser && existingUser.id !== parseInt(id)) {
      return res.status(400).json({ error: 'Email já está em uso!' });
    }
  }

  next();
});

server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running on http://localhost:3000');
});