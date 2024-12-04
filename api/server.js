const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json'); // Certifique-se de que db.json está na mesma pasta
const middlewares = jsonServer.defaults();

// Usar middlewares padrão
server.use(middlewares);

// Middleware para reescrever a URL
server.use(jsonServer.rewriter({
  '/api/*': '/$1',
}));

// Middleware para parsear o corpo da requisição
server.use(jsonServer.bodyParser);

// Middleware para tratar erros de JSON inválido
server.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Corpo da requisição JSON inválido!' });
  }
  next();
});

// Função para validar se o email está no formato correto
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validação de criação de usuário
server.post('/users', (req, res, next) => {
  console.log('Request Body (Create User):', req.body); // Log do corpo da requisição para depuração

  // Verifica se o corpo da requisição está vazio
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Corpo da requisição não enviado ou vazio!' });
  }

  const { email } = req.body;

  // Verifica se o email foi fornecido
  if (!email || email.trim() === '') {
    return res.status(400).json({ error: 'Email é obrigatório!' });
  }

  // Verifica se o email está em um formato válido
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Email no formato inválido!' });
  }

  // Verifica se o email já está em uso
  const existingUser = router.db.get('users').find({ email }).value();
  if (existingUser) {
    return res.status(400).json({ error: 'Email já está em uso!' });
  }

  next(); // Passa para o próximo middleware se tudo estiver correto
});

// Validação de atualização de usuário
server.put('/users/:id', (req, res, next) => {
  console.log('Request Body (Update User):', req.body); // Log do corpo da requisição para depuração
  const { id } = req.params;
  const { email } = req.body;

  // Verifica se o usuário existe
  const user = router.db.get('users').find({ id: parseInt(id) }).value();
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado!' });
  }

  // Verifica se o corpo da requisição está vazio
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Corpo da requisição não enviado ou vazio!' });
  }

  // Verifica se o email foi alterado e se já está em uso
  if (email) {
    if (!email.trim()) {
      return res.status(400).json({ error: 'Email não pode ser um espaço em branco!' });
    }

    // Verifica se o email está em um formato válido
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email no formato inválido!' });
    }

    const existingUser = router.db.get('users').find({ email }).value();
    if (existingUser && existingUser.id !== parseInt(id)) {
      return res.status(400).json({ error: 'Email já está em uso!' });
    }
  }

  next(); // Passa para o próximo middleware se tudo estiver correto
});

// Validação de criação de post
server.post('/posts', (req, res, next) => {
  console.log('Request Body (Create Post):', req.body); // Log do corpo da requisição para depuração

  // Verifica se o corpo da requisição está vazio
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Corpo da requisição não enviado ou vazio!' });
  }

  const { userId } = req.body;

  // Verifica se o userId é válido
  const user = router.db.get('users').find({ id: userId }).value();
  if (!user) {
    return res.status(400).json({ error: 'userId inválido!' });
  }

  next(); // Passa para o próximo middleware se tudo estiver correto
});

// Validação de atualização de post
server.put('/posts/:id', (req, res, next) => {
  console.log('Request Body (Update Post):', req.body); // Log do corpo da requisição para depuração
  const { id } = req.params;

  // Verifica se o post existe
  const post = router.db.get('posts').find({ id: parseInt(id) }).value();
  if (!post) {
    return res.status(404).json({ error: 'Post não encontrado!' });
  }

  next(); // Passa para o próximo middleware se tudo estiver correto
});

// Usar o roteador
server.use(router);

// Iniciar o servidor
server.listen(3000, () => {
  console.log('JSON Server is running on http://localhost:3000');
});