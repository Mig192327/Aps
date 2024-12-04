const express = require("express");
const rotas = express();
const Sequelize = require("sequelize");
const Cors = require("cors");

rotas.use(Cors());
rotas.use(express.json());

// Conexão com o banco de dados MySQL
const conexaoBanco = new Sequelize("sistema_gerenciamento", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

// Autenticação de conexão com o banco de dados
conexaoBanco
  .authenticate()
  .then(() => {
    console.log("Conexão com o banco de dados foi bem-sucedida.");
  })
  .catch((error) => {
    console.error("Não foi possível conectar ao banco de dados:", error);
  });

// Definição das tabelas com as chaves primárias e relacionamentos
const alunos = conexaoBanco.define("Aluno", {
  id_aluno: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: Sequelize.STRING,
  },
  telefone: {
    type: Sequelize.STRING,
  },
  endereco: {
    type: Sequelize.STRING,
  },
});

const professores = conexaoBanco.define("Professor", {
  id_professor: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: Sequelize.STRING,
  },
  disciplina: {
    type: Sequelize.STRING,
  },
});

const turmas = conexaoBanco.define("Turma", {
  id_turma: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome_turma: {
    type: Sequelize.STRING,
  },
  horario: {
    type: Sequelize.STRING,
  },
  capacidade: {
    type: Sequelize.INTEGER,
  },
});

const reservas = conexaoBanco.define("Reserva", {
  id_reserva: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  data_hora: {
    type: Sequelize.DATE,
  },
  duracao: {
    type: Sequelize.INTEGER,
  },
});

// Relacionamentos
// Aluno pode estar em várias reservas (matriculado em várias turmas)
reservas.belongsTo(alunos, { foreignKey: "id_aluno" });
alunos.hasMany(reservas, { foreignKey: "id_aluno" });

// Professor pode ministrar várias turmas
turmas.belongsTo(professores, { foreignKey: "id_professor" });
professores.hasMany(turmas, { foreignKey: "id_professor" });

// Sincronizar com o banco de dados
conexaoBanco.sync({ force: false });

// Middleware para processar dados do formulário
rotas.use(express.urlencoded({ extended: true }));
rotas.use(express.json());

// Rota para cadastrar aluno
rotas.post("/alunos", async (req, res) => {
  const { nome, telefone, endereco } = req.body;

  if (!nome || !telefone || !endereco) {
    return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });
  }

  try {
    const novoAluno = await alunos.create({ nome, telefone, endereco });
    res.status(201).json({ mensagem: "Aluno cadastrado com sucesso!", aluno: novoAluno });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao cadastrar aluno", erro: error.message });
  }
});

// Rota para exibir todos os alunos
rotas.get("/alunos", async (req, res) => {
  try {
    const alunosList = await alunos.findAll();
    res.json(alunosList); // Retorna os alunos em formato JSON
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    res.status(500).json({ mensagem: "Erro ao buscar alunos", erro: error.message });
  }
});

// Rota para cadastrar professor
rotas.post("/professores", async (req, res) => {
  const { nome, disciplina } = req.body;

  if (!nome || !disciplina) {
    return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });
  }

  try {
    const novoProfessor = await professores.create({ nome, disciplina });
    res.status(201).json({ mensagem: "Professor cadastrado com sucesso!", professor: novoProfessor });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao cadastrar professor", erro: error.message });
  }
});

// Rota para exibir todos os professores
rotas.get("/professores", async (req, res) => {
    try {
      const professoresList = await professores.findAll(); // Recupera todos os professores do banco de dados
      res.json(professoresList); // Retorna os professores em formato JSON
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
      res.status(500).json({ mensagem: "Erro ao buscar professores", erro: error.message });
    }
  });
  
// Rota para cadastrar turma
rotas.post("/turmas", async (req, res) => {
  const { nome_turma, horario, capacidade, id_professor } = req.body;

  if (!nome_turma || !horario || !capacidade || !id_professor) {
    return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });
  }

  try {
    const novaTurma = await turmas.create({ nome_turma, horario, capacidade, id_professor });
    res.status(201).json({ mensagem: "Turma cadastrada com sucesso!", turma: novaTurma });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao cadastrar turma", erro: error.message });
  }
});


// Iniciar o servidor
rotas.listen(3031, function () {
  console.log("Servidor rodando na porta 3031");
});
