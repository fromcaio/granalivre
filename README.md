# GranaLivre

**GranaLivre** é um sistema open source de finanças pessoais, que permite aos usuários controlar receitas, despesas, investimentos e patrimônio. Este repositório organiza todo o desenvolvimento inicial, desde protótipos de baixa fidelidade até diagramas, sistema e documentação.

## Estrutura do Repositório

```
/ (raiz do repositório)
├── doc/                  # Toda a documentação do projeto
│   ├── diagramas/        # Diagramas (UML, ER, casos de uso, etc.)
│   │   ├── casos-uso.excalidraw
│   │   ├── er-diagrama.excalidraw
│   │   └── exportados/   # versões em PDF/PNG para inclusão no LaTeX
│   │   │   ├── casos-uso.png
│   ├── latex/            # Arquivos-fonte em LaTeX
│   │   ├── main.tex      # Documento principal
│   │   ├── seções/       # Seções separadas (importadas no main.tex)
│   │   └── bib/          # Caso precisem referências bibliográficas
│   └── pdf/              # Versões finais exportadas (main.pdf)
│
├── telas/                # Protótipos de baixa fidelidade
│   ├── excalidraw/       # Arquivos editáveis
│   └── exportados/       # PNG/PDF das telas
│
├── tarefas/              # Checklists e organização das atividades
│   ├── backlog.md        # Lista geral de tarefas
│   ├── sprints/          # Organização por entregas
│   │   └── sprint-01.md
│   └── responsaveis.md   # Quem cuida de quê
│
├── praticas/             # Pastas para práticas/testes de equipe
│   ├── css-display-flex/
│   ├── html-forms/
│   └── ...
│
└── granalivre/           # Código-fonte do sistema (quando iniciarem dev)
    ├── frontend/
    ├── backend/
    └── database/
```

## Como Contribuir

1. **Clonar o repositório**
```bash
git clone https://github.com/seuusuario/granalivre.git
cd granalivre
```

2. **Criar uma nova branch para sua atividade**
```bash
git checkout -b minha-atividade
```

3. **Adicionar alterações e realizar commit**
```bash
git add .
git commit -m "Descrição do que foi feito"
```

4. **Enviar a branch para o GitHub**
```bash
git push origin minha-atividade
```

5. Abrir Pull Request no GitHub
- No repositório no GitHub, clique em Compare & pull request da sua branch.
- Escreva um título claro e uma descrição breve do que foi feito.
- Escolha a branch main como base para mesclar.
- Adicione revisores da equipe, se necessário.
- Clique em Create Pull Request.
- Aguarde a revisão e aprovação.

## Protótipos e Diagramas

- Criar ou editar arquivos em telas/excalidraw/ ou doc/diagramas/.
- Exportar versões PDF/PNG para telas/exportados/ ou doc/diagramas/exportados-pdf/.
- Referenciar esses arquivos no LaTeX (doc/latex/seções/06-prototipos.tex).

## Tarefas e Organização

- Atualizar checklists em tarefas/sprints/.
- Registrar responsabilidades em tarefas/responsaveis.md.
- Usar Issues para discutir problemas ou sugestões.