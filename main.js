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

// Relacionamentos

// Adicione a chave estrangeira `id_turma` ao modelo de Alunos
alunos.belongsTo(turmas, { foreignKey: "id_turma" });
turmas.hasMany(alunos, { foreignKey: "id_turma" });


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

// Rota para editar os dados de um aluno
rotas.put("/alunos/:id", async (req, res) => {
  const id = req.params.id; // Obtém o ID do aluno a partir dos parâmetros da URL
  const { nome, telefone, endereco } = req.body; // Obtém os novos dados do aluno do corpo da requisição

  // Verifica se todos os campos obrigatórios foram fornecidos
  if (!nome || !telefone || !endereco) {
    return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });
  }

  try {
    // Procura o aluno no banco de dados pelo ID
    const aluno = await alunos.findByPk(id);

    // Se o aluno não for encontrado, retorna erro 404
    if (!aluno) {
      return res.status(404).json({ mensagem: "Aluno não encontrado!" });
    }

    // Atualiza os dados do aluno
    aluno.nome = nome;
    aluno.telefone = telefone;
    aluno.endereco = endereco;

    // Salva as alterações no banco de dados
    await aluno.save();

    // Retorna uma resposta de sucesso com os dados atualizados
    res.status(200).json({ mensagem: "Aluno atualizado com sucesso!", aluno });
  } catch (error) {
    // Em caso de erro, retorna uma mensagem de erro
    res.status(500).json({ mensagem: "Erro ao atualizar aluno", erro: error.message });
  }
});


// Rota para excluir aluno
rotas.delete("/alunos/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const aluno = await alunos.findByPk(id);
    if (!aluno) {
      return res.status(404).json({ mensagem: "Aluno não encontrado!" });
    }
    await aluno.destroy();
    res.status(200).json({ mensagem: "Aluno excluído com sucesso!" });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao excluir aluno", erro: error.message });
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

// Rota para exibir todas as turmas
rotas.get("/turmas", async (req, res) => {
  try {
    const turmasList = await turmas.findAll({
      include: [
        {
          model: professores,
          attributes: ['nome'], // Inclui apenas o nome do professor
        },
      ],
    });
    res.json(turmasList); // Retorna as turmas em formato JSON
  } catch (error) {
    console.error("Erro ao buscar turmas:", error);
    res.status(500).json({ mensagem: "Erro ao buscar turmas", erro: error.message });
  }
});

// Rota para obter alunos de uma turma específica
rotas.get("/turmas/:id_turma/alunos", async (req, res) => {
  const { id_turma } = req.params;

  try {
    const turma = await turmas.findByPk(id_turma, {
      include: [
        {
          model: alunos,
          attributes: ["id_aluno", "nome", "telefone", "endereco"],
        },
      ],
    });

    if (!turma) {
      return res.status(404).json({ mensagem: "Turma não encontrada!" });
    }

    res.json(turma.Alunos); // Retorna a lista de alunos da turma
  } catch (error) {
    console.error("Erro ao buscar alunos da turma:", error);
    res.status(500).json({ mensagem: "Erro ao buscar alunos", erro: error.message });
  }
});

rotas.post("/matricular", async (req, res) => {
  const { id_aluno, id_turma } = req.body;

  if (!id_aluno || !id_turma) {
    return res.status(400).json({ mensagem: "ID do aluno e ID da turma são obrigatórios." });
  }

  try {
    // Verifica se o aluno existe
    const aluno = await alunos.findByPk(id_aluno);
    if (!aluno) {
      return res.status(404).json({ mensagem: "Aluno não encontrado." });
    }

    // Verifica se a turma existe
    const turma = await turmas.findByPk(id_turma);
    if (!turma) {
      return res.status(404).json({ mensagem: "Turma não encontrada." });
    }

    // Atualiza a turma do aluno
    aluno.id_turma = id_turma;
    await aluno.save();

    res.status(200).json({
      mensagem: "Aluno matriculado com sucesso!",
      aluno: {
        id_aluno: aluno.id_aluno,
        nome: aluno.nome,
        id_turma: aluno.id_turma,
      },
    });
  } catch (error) {
    console.error("Erro ao matricular aluno:", error);
    res.status(500).json({ mensagem: "Erro ao matricular aluno", erro: error.message });
  }
});


// Iniciar o servidor
rotas.listen(3031, function () {
  console.log("Servidor rodando na porta 3031");
});
