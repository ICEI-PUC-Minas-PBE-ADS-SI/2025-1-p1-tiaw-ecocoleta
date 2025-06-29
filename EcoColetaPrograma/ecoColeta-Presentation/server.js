require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jsonServer = require('json-server');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const jsonServerRouter = jsonServer.router('db.json');
const jsonServerMiddlewares = jsonServer.defaults();

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'public', 'uploads', 'comunidades');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas arquivos JPEG e PNG são permitidos'));
    }
  }
});

// Configuração completa do CORS
const corsOptions = {
  origin: [
    'http://localhost:5500',    // Live Server padrão
    'http://127.0.0.1:5500',   // Live Server alternativo
    'http://localhost:5501',    // Live Server porta alternativa
    'http://127.0.0.1:5501',   // Live Server porta alternativa
    'http://localhost:3000',    // Próprio servidor
    'http://127.0.0.1:3000',   // Próprio servidor
    'http://localhost:8080',    // Outra porta comum
    'http://127.0.0.1:8080'    // Outra porta comum
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

app.use(cors(corsOptions));

// Middleware para logs de requisições (útil para debug)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'no-origin'}`);
  next();
});

app.use(bodyParser.json());
app.use(express.static('public')); // Servir arquivos estáticos da pasta public
app.use('/src', express.static('src')); // Servir arquivos CSS e JS
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// PATCH para deduzir ecopontos de usuário ao resgatar recompensa
app.patch('/api/usuarios/:id/resgatar-recompensa', (req, res) => {
  try {
    const { id } = req.params;
    const { pontosNecessarios, nomeRecompensa, recompensaId } = req.body;
    if (!pontosNecessarios || !nomeRecompensa || !recompensaId) {
      return res.status(400).json({ error: 'Dados insuficientes para resgate.' });
    }
    const usuario = jsonServerRouter.db.get('usuarios').find({ id: parseInt(id) }).value();
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    if ((usuario.ecopontos || 0) < pontosNecessarios) {
      return res.status(400).json({ error: 'Ecopontos insuficientes.' });
    }
    // Deduz apenas os ecopontos
    usuario.ecopontos = (usuario.ecopontos || 0) - pontosNecessarios;
    jsonServerRouter.db.get('usuarios')
      .find({ id: parseInt(id) })
      .assign({ ecopontos: usuario.ecopontos })
      .write();
    // Decrementa a quantidade da recompensa
    const recompensa = jsonServerRouter.db.get('recompensas').find({ id: recompensaId }).value();
    if (!recompensa) {
      return res.status(404).json({ error: 'Recompensa não encontrada' });
    }
    if (!recompensa.quantidade || recompensa.quantidade <= 0) {
      return res.status(400).json({ error: 'Recompensa indisponível.' });
    }
    recompensa.quantidade = recompensa.quantidade - 1;
    jsonServerRouter.db.get('recompensas')
      .find({ id: recompensaId })
      .assign({ quantidade: recompensa.quantidade })
      .write();
    res.json({
      message: 'Recompensa resgatada com sucesso!',
      ecopontos: usuario.ecopontos,
      quantidadeRestante: recompensa.quantidade
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao resgatar recompensa', details: error.message });
  }
});

// Configuração específica do JSON Server com CORS
app.use('/api', (req, res, next) => {
  // Headers CORS específicos para JSON Server
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Responder OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// ROTA PARA AGENDAR COLETA E SALVAR NO db.json
app.post('/api/pontosDeColeta/:id/agendar', (req, res) => {
  const db = jsonServerRouter.db;
  const id = parseInt(req.params.id, 10);
  const agendamento = req.body;

  // LOGS DE DEPURAÇÃO
  console.log('--- AGENDAR COLETA ---');
  console.log('ID recebido:', id);
  console.log('Body recebido:', agendamento);
  const ponto = db.get('pontosDeColeta').find({ id }).value();
  console.log('Ponto encontrado:', ponto);
  if (!ponto) {
    console.log('Ponto de coleta NÃO encontrado para o id:', id);
    return res.status(404).json({ error: 'Ponto de coleta não encontrado' });
  }

  // Gera um idAgenda único
  agendamento.idAgenda = `agenda-ecoponto${id}-${Date.now()}`;

  // Adiciona ao array agenda
  db.get('pontosDeColeta')
    .find({ id })
    .get('agenda')
    .push(agendamento)
    .write();

  res.status(201).json(agendamento);
});

// JSON Server routes (deixe sempre por último)
app.use('/api', jsonServerMiddlewares, jsonServerRouter);

// Stripe payment intent endpoint
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'brl',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save donation endpoint
app.post('/api/donations', async (req, res) => {
  try {
    const donation = {
      ...req.body,
      id: Date.now(),
      date: new Date().toISOString(),
      status: 'completed'
    };

    jsonServerRouter.db.get('donations').push(donation).write();
    res.json(donation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Comunidades endpoints
// GET todas as comunidades com paginação e filtros
app.get('/api/comunidades', (req, res) => {
  try {
    const { page = 1, limit = 10, tipo, autor, status = 'ativa' } = req.query;
    const offset = (page - 1) * limit;
    
    let comunidades = jsonServerRouter.db.get('comunidades').value() || [];
    
    // Filtros
    if (tipo) {
      comunidades = comunidades.filter(c => c.tipo === tipo);
    }
    if (autor) {
      comunidades = comunidades.filter(c => c.autor.nome.toLowerCase().includes(autor.toLowerCase()));
    }
    if (status) {
      comunidades = comunidades.filter(c => c.status === status);
    }
    
    // Ordenar por data de criação (mais recente primeiro)
    comunidades.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
    
    // Paginação
    const total = comunidades.length;
    const paginatedComunidades = comunidades.slice(offset, offset + parseInt(limit));
    
    res.json({
      comunidades: paginatedComunidades,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar comunidades', details: error.message });
  }
});

// GET comunidade específica por ID
app.get('/api/comunidades/:id', (req, res) => {
  try {
    const { id } = req.params;
    const comunidade = jsonServerRouter.db.get('comunidades').find({ id: parseInt(id) }).value();
    
    if (!comunidade) {
      return res.status(404).json({ error: 'Comunidade não encontrada' });
    }
    
    // Incrementar visualizações
    jsonServerRouter.db.get('comunidades')
      .find({ id: parseInt(id) })
      .assign({ visualizacoes: (comunidade.visualizacoes || 0) + 1 })
      .write();
    
    res.json(comunidade);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar comunidade', details: error.message });
  }
});

// POST criar nova comunidade
app.post('/api/comunidades', upload.single('banner'), async (req, res) => {
  try {
    const { nome, descricao, tipo, regras, autorId, autorNome, autorEmail, autorFoto } = req.body;
    
    // Validações
    if (!nome || nome.trim().length < 3) {
      return res.status(400).json({ error: 'Nome da comunidade deve ter pelo menos 3 caracteres' });
    }
    
    if (!descricao || descricao.trim().length < 20) {
      return res.status(400).json({ error: 'Descrição deve ter pelo menos 20 caracteres' });
    }
    
    if (!tipo) {
      return res.status(400).json({ error: 'Tipo da comunidade é obrigatório' });
    }
    
    if (!autorNome || !autorEmail) {
      return res.status(400).json({ error: 'Dados do autor são obrigatórios' });
    }
    
    // Verificar se já existe uma comunidade com o mesmo nome
    const existingCommunity = jsonServerRouter.db.get('comunidades')
      .find({ nome: nome.trim() })
      .value();
    
    if (existingCommunity) {
      return res.status(409).json({ error: 'Já existe uma comunidade com este nome' });
    }
    
    // Gerar ID único
    const newId = Date.now();
    
    // URL do banner
    let bannerUrl = 'https://placehold.co/1200x300';
    if (req.file) {
      bannerUrl = `/uploads/comunidades/${req.file.filename}`;
    }
    
    // Corrigir membros: array de IDs
    let membros = [];
    if (autorId) {
      membros = [parseInt(autorId)];
    } else {
      membros = [newId];
    }
    
    // Criar objeto da comunidade
    const novaComunidade = {
      id: newId,
      nome: nome.trim(),
      descricao: descricao.trim(),
      tipo: tipo,
      regras: regras ? regras.trim() : '',
      banner: bannerUrl,
      autor: {
        id: autorId ? parseInt(autorId) : newId,
        nome: autorNome.trim(),
        email: autorEmail.trim(),
        foto: autorFoto || 'https://placehold.co/80'
      },
      dataCriacao: new Date().toISOString(),
      status: 'ativa',
      membros: membros, // array de IDs
      curtidas: 0,
      comentarios: [], // garantir array
      visualizacoes: 0,
      tags: gerarTags(nome, descricao, tipo)
    };
    
    // Salvar no banco
    jsonServerRouter.db.get('comunidades').push(novaComunidade).write();
    
    res.status(201).json({
      message: 'Comunidade criada com sucesso!',
      comunidade: novaComunidade
    });
    
  } catch (error) {
    console.error('Erro ao criar comunidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

// PATCH participar/sair da comunidade (manipula array de membros)
app.patch('/api/comunidades/:id/membros', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, action } = req.body; // action: 'entrar' ou 'sair'
    const comunidade = jsonServerRouter.db.get('comunidades').find({ id: parseInt(id) }).value();
    if (!comunidade) {
      return res.status(404).json({ error: 'Comunidade não encontrada' });
    }
    let membros = Array.isArray(comunidade.membros) ? comunidade.membros : [];
    const uid = parseInt(userId);
    if (action === 'entrar') {
      if (!membros.includes(uid)) membros.push(uid);
    } else if (action === 'sair') {
      membros = membros.filter(m => m !== uid);
    }
    jsonServerRouter.db.get('comunidades')
      .find({ id: parseInt(id) })
      .assign({ membros })
      .write();
    res.json({ membros });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar membros', details: error.message });
  }
});

// PUT atualizar comunidade
app.put('/api/comunidades/:id', upload.single('banner'), (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, tipo, regras } = req.body;
    
    const comunidade = jsonServerRouter.db.get('comunidades').find({ id: parseInt(id) }).value();
    
    if (!comunidade) {
      return res.status(404).json({ error: 'Comunidade não encontrada' });
    }
    
    const updates = {};
    
    if (nome && nome.trim() !== comunidade.nome) {
      // Verificar se o novo nome já existe
      const existingCommunity = jsonServerRouter.db.get('comunidades')
        .find({ nome: nome.trim() })
        .value();
      
      if (existingCommunity && existingCommunity.id !== parseInt(id)) {
        return res.status(409).json({ error: 'Já existe uma comunidade com este nome' });
      }
      
      updates.nome = nome.trim();
    }
    
    if (descricao) updates.descricao = descricao.trim();
    if (tipo) updates.tipo = tipo;
    if (regras !== undefined) updates.regras = regras.trim();
    
    if (req.file) {
      updates.banner = `/uploads/comunidades/${req.file.filename}`;
    }
    
    if (Object.keys(updates).length > 0) {
      updates.tags = gerarTags(updates.nome || comunidade.nome, updates.descricao || comunidade.descricao, updates.tipo || comunidade.tipo);
    }
    
    const comunidadeAtualizada = jsonServerRouter.db.get('comunidades')
      .find({ id: parseInt(id) })
      .assign(updates)
      .write();
    
    res.json({
      message: 'Comunidade atualizada com sucesso!',
      comunidade: comunidadeAtualizada
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar comunidade', details: error.message });
  }
});

// DELETE comunidade
app.delete('/api/comunidades/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const comunidade = jsonServerRouter.db.get('comunidades').find({ id: parseInt(id) }).value();
    
    if (!comunidade) {
      return res.status(404).json({ error: 'Comunidade não encontrada' });
    }
    
    // Marcar como inativa ao invés de deletar
    jsonServerRouter.db.get('comunidades')
      .find({ id: parseInt(id) })
      .assign({ status: 'inativa' })
      .write();
    
    res.json({ message: 'Comunidade removida com sucesso!' });
    
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover comunidade', details: error.message });
  }
});

// POST curtir/descurtir comunidade
app.post('/api/comunidades/:id/curtir', (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'like' ou 'unlike'
    
    const comunidade = jsonServerRouter.db.get('comunidades').find({ id: parseInt(id) }).value();
    
    if (!comunidade) {
      return res.status(404).json({ error: 'Comunidade não encontrada' });
    }
    
    let novasCurtidas = comunidade.curtidas || 0;
    
    if (action === 'like') {
      novasCurtidas += 1;
    } else if (action === 'unlike' && novasCurtidas > 0) {
      novasCurtidas -= 1;
    }
    
    jsonServerRouter.db.get('comunidades')
      .find({ id: parseInt(id) })
      .assign({ curtidas: novasCurtidas })
      .write();
    
    res.json({ curtidas: novasCurtidas });
    
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar curtida', details: error.message });
  }
});


// ROTA PARA AGENDAR COLETA E SALVAR NO db.json
app.post('/api/pontosDeColeta/:id/agendar', (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = req.body;
    // Busca o ponto de coleta
    const ponto = jsonServerRouter.db.get('pontosDeColeta').find({ id: parseInt(id) }).value();
    if (!ponto) {
      return res.status(404).json({ error: 'Ponto de coleta não encontrado' });
    }
    // Gera id único para o agendamento
    agendamento.idAgenda = `agenda-${id}-${Date.now()}`;
    agendamento.status = agendamento.status || 'pendente';
    // Adiciona ao array agenda
    if (!Array.isArray(ponto.agenda)) ponto.agenda = [];
    ponto.agenda.push(agendamento);
    // Salva no db.json
    jsonServerRouter.db.get('pontosDeColeta')
      .find({ id: parseInt(id) })
      .assign({ agenda: ponto.agenda })
      .write();
    res.status(201).json({ message: 'Agendamento salvo com sucesso!', agendamento });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar agendamento', details: error.message });
  }
});

// POST criar agendamento para ponto de coleta
app.post('/api/pontosDeColeta/:id/agendamentos', (req, res) => {
  try {
    const { id } = req.params;
    const agendamentoData = req.body;
    
    // Buscar o ponto de coleta
    const ponto = jsonServerRouter.db.get('pontosDeColeta').find({ id: parseInt(id) }).value();
    
    if (!ponto) {
      return res.status(404).json({ error: 'Ponto de coleta não encontrado' });
    }
    
    // Gerar ID único para o agendamento
    const agendamentoId = `agenda-ecoponto${id}-${Date.now()}`;
    
    // Criar objeto do agendamento
    const novoAgendamento = {
      idAgenda: agendamentoId,
      idUsuarioAgendamento: agendamentoData.idUsuarioAgendamento || 2,
      coletorId: ponto.coletorId || agendamentoData.coletorId || 8,
      dataHoraInicio: agendamentoData.dataHoraInicio,
      dataHoraFim: agendamentoData.dataHoraFim,
      tipo: agendamentoData.tipo || 'coleta_agendada',
      descricao: agendamentoData.descricao,
      status: agendamentoData.status || 'agendado',
      materiais: agendamentoData.materiais || [],
      contatoResponsavel: agendamentoData.contatoResponsavel,
      observacoes: agendamentoData.observacoes || '',
      dataCriacao: new Date().toISOString()
    };
    
    // Inicializar array de agenda se não existir
    if (!ponto.agenda) {
      ponto.agenda = [];
    }
    
    // Adicionar o agendamento ao array
    ponto.agenda.push(novoAgendamento);
    
    // Atualizar o ponto de coleta no banco
    jsonServerRouter.db.get('pontosDeColeta')
      .find({ id: parseInt(id) })
      .assign({ agenda: ponto.agenda })
      .write();
    
    res.status(201).json({
      message: 'Agendamento criado com sucesso!',
      agendamento: novoAgendamento,
      pontoColeta: ponto.nome
    });
    
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao criar agendamento', details: error.message });
  }
});

// GET listar agendamentos de um ponto de coleta
app.get('/api/pontosDeColeta/:id/agendamentos', (req, res) => {
  try {
    const { id } = req.params;
    const { status, dataInicio, dataFim } = req.query;
    
    const ponto = jsonServerRouter.db.get('pontosDeColeta').find({ id: parseInt(id) }).value();
    
    if (!ponto) {
      return res.status(404).json({ error: 'Ponto de coleta não encontrado' });
    }
    
    let agendamentos = ponto.agenda || [];
    
    // Filtrar por status se fornecido
    if (status) {
      agendamentos = agendamentos.filter(a => a.status === status);
    }
    
    // Filtrar por período se fornecido
    if (dataInicio && dataFim) {
      agendamentos = agendamentos.filter(a => {
        const dataAgenda = new Date(a.dataHoraInicio);
        return dataAgenda >= new Date(dataInicio) && dataAgenda <= new Date(dataFim);
      });
    }
    
    res.json({
      pontoColeta: {
        id: ponto.id,
        nome: ponto.nome,
        endereco: ponto.endereco
      },
      agendamentos: agendamentos
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos', details: error.message });
  }
});

// PATCH atualizar status de agendamento
app.patch('/api/pontosDeColeta/:pontoId/agendamentos/:agendaId', (req, res) => {
  try {
    const { pontoId, agendaId } = req.params;
    const { status, observacoes } = req.body;
    
    const ponto = jsonServerRouter.db.get('pontosDeColeta').find({ id: parseInt(pontoId) }).value();
    
    if (!ponto) {
      return res.status(404).json({ error: 'Ponto de coleta não encontrado' });
    }
    
    const agendamentos = ponto.agenda || [];
    const agendamentoIndex = agendamentos.findIndex(a => a.idAgenda === agendaId);
    
    if (agendamentoIndex === -1) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    // Atualizar agendamento
    if (status) agendamentos[agendamentoIndex].status = status;
    if (observacoes) agendamentos[agendamentoIndex].observacoes = observacoes;
    agendamentos[agendamentoIndex].dataAtualizacao = new Date().toISOString();
    
    // Salvar alterações
    jsonServerRouter.db.get('pontosDeColeta')
      .find({ id: parseInt(pontoId) })
      .assign({ agenda: agendamentos })
      .write();
    
    res.json({
      message: 'Agendamento atualizado com sucesso!',
      agendamento: agendamentos[agendamentoIndex]
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar agendamento', details: error.message });
  }
});

// POST criar agendamento diretamente na tabela agendamentos
app.post('/api/agendamentos', (req, res) => {
  try {
    const { pontoColetaId, doadorEmail, dataAgendamento, horarioAgendamento, tipoMaterial, observacoes } = req.body;
    
    if (!pontoColetaId || !doadorEmail || !dataAgendamento || !horarioAgendamento || !tipoMaterial) {
      return res.status(400).json({ error: 'Dados obrigatórios faltando' });
    }
    
    // Verificar se o ponto de coleta existe
    const ponto = jsonServerRouter.db.get('pontosDeColeta').find({ id: parseInt(pontoColetaId) }).value();
    if (!ponto) {
      return res.status(404).json({ error: 'Ponto de coleta não encontrado' });
    }
    
    // Buscar dados do doador
    const doador = jsonServerRouter.db.get('usuarios').find({ email: doadorEmail }).value();
    if (!doador) {
      return res.status(404).json({ error: 'Usuário doador não encontrado' });
    }
    
    // Gerar ID único para o agendamento
    const agendamentoId = Date.now();
    
    // Criar objeto do agendamento para a tabela agendamentos
    const novoAgendamento = {
      id: agendamentoId,
      pontoColetaId: parseInt(pontoColetaId),
      doadorId: doador.id,
      doadorEmail: doadorEmail,
      doadorNome: doador.nome,
      coletorId: ponto.coletorId,
      pontoColetaNome: ponto.nome,
      dataAgendamento: dataAgendamento,
      horarioAgendamento: horarioAgendamento,
      tipoMaterial: tipoMaterial,
      observacoes: observacoes || '',
      status: 'pendente',
      dataCriacao: new Date().toISOString()
    };
    
    // Adicionar à tabela agendamentos
    if (!jsonServerRouter.db.get('agendamentos').value()) {
      jsonServerRouter.db.set('agendamentos', []).write();
    }
    jsonServerRouter.db.get('agendamentos').push(novoAgendamento).write();
    
    // Também adicionar ao array agenda do ponto de coleta (para compatibilidade)
    const agendamentoPonto = {
      idAgenda: `agenda-${pontoColetaId}-${agendamentoId}`,
      idUsuarioAgendamento: doador.id,
      coletorId: ponto.coletorId,
      dataHoraInicio: `${dataAgendamento}T${horarioAgendamento}:00`,
      dataHoraFim: `${dataAgendamento}T${horarioAgendamento}:00`,
      tipo: 'coleta_agendada',
      descricao: `Coleta de ${tipoMaterial}`,
      status: 'agendado',
      materiais: [tipoMaterial],
      contatoResponsavel: doadorEmail,
      observacoes: observacoes || '',
      dataCriacao: new Date().toISOString()
    };
    
    if (!ponto.agenda) {
      ponto.agenda = [];
    }
    ponto.agenda.push(agendamentoPonto);
    
    jsonServerRouter.db.get('pontosDeColeta')
      .find({ id: parseInt(pontoColetaId) })
      .assign({ agenda: ponto.agenda })
      .write();
    
    res.status(201).json({
      message: 'Agendamento criado com sucesso!',
      agendamento: novoAgendamento
    });
    
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao criar agendamento', details: error.message });
  }
});

// GET listar todos os agendamentos
app.get('/api/agendamentos', (req, res) => {
  try {
    const { doadorEmail, pontoColetaId, status } = req.query;
    
    let agendamentos = jsonServerRouter.db.get('agendamentos').value() || [];
    
    // Filtros
    if (doadorEmail) {
      agendamentos = agendamentos.filter(a => a.doadorEmail === doadorEmail);
    }
    if (pontoColetaId) {
      agendamentos = agendamentos.filter(a => a.pontoColetaId === parseInt(pontoColetaId));
    }
    if (status) {
      agendamentos = agendamentos.filter(a => a.status === status);
    }
    
    // Ordenar por data de criação (mais recente primeiro)
    agendamentos.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
    
    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos', details: error.message });
  }
});

// GET agendamento específico por ID
app.get('/api/agendamentos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = jsonServerRouter.db.get('agendamentos').find({ id: parseInt(id) }).value();
    
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    res.json(agendamento);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamento', details: error.message });
  }
});

// PATCH atualizar status do agendamento
app.patch('/api/agendamentos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, observacoes } = req.body;
    
    const agendamento = jsonServerRouter.db.get('agendamentos').find({ id: parseInt(id) }).value();
    
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    const updates = {};
    if (status) updates.status = status;
    if (observacoes) updates.observacoes = observacoes;
    updates.dataAtualizacao = new Date().toISOString();
    
    const agendamentoAtualizado = jsonServerRouter.db.get('agendamentos')
      .find({ id: parseInt(id) })
      .assign(updates)
      .write();
    
    res.json({
      message: 'Agendamento atualizado com sucesso!',
      agendamento: agendamentoAtualizado
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar agendamento', details: error.message });
  }
});


// Função auxiliar para gerar tags
function gerarTags(nome, descricao, tipo) {
  const texto = `${nome} ${descricao} ${tipo}`.toLowerCase();
  const palavrasComuns = ['a', 'o', 'e', 'de', 'do', 'da', 'em', 'um', 'uma', 'para', 'com', 'por'];
  
  const palavras = texto.split(/\s+/)
    .filter(palavra => palavra.length > 2 && !palavrasComuns.includes(palavra))
    .slice(0, 5);
  
  return [...new Set(palavras)]; // Remove duplicatas
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});