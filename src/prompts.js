const inquirer = require('inquirer');

const QUESTIONS = [
  {
    type: 'input',
    name: 'projectName',
    message: 'Project name:',
    default: () => {
      const path = require('path');
      return path.basename(process.cwd());
    },
  },
  {
    type: 'input',
    name: 'projectDescription',
    message: 'Short project description:',
    default: '',
  },
  {
    type: 'list',
    name: 'stack',
    message: 'Primary tech stack:',
    choices: [
      'Node.js',
      'React',
      'Next.js',
      'Vue',
      'Python',
      'TypeScript',
      'Go',
      'Other',
    ],
  },
  {
    type: 'input',
    name: 'stackOther',
    message: 'Specify your stack:',
    when: (answers) => answers.stack === 'Other',
  },
  {
    type: 'checkbox',
    name: 'extras',
    message: 'Additional tools/frameworks:',
    choices: [
      'Tailwind CSS',
      'Docker',
      'PostgreSQL',
      'MongoDB',
      'Redis',
      'GraphQL',
      'REST API',
      'Prisma',
    ],
  },
  {
    type: 'input',
    name: 'targetAudience',
    message: 'Target audience (who is this for?):',
    default: '',
  },
];

async function askQuestions() {
  const answers = await inquirer.prompt(QUESTIONS);

  if (answers.stack === 'Other' && answers.stackOther) {
    answers.stack = answers.stackOther;
  }
  delete answers.stackOther;

  return answers;
}

function getDefaults() {
  const path = require('path');
  return {
    projectName: path.basename(process.cwd()),
    projectDescription: '',
    stack: '',
    extras: [],
    targetAudience: '',
  };
}

module.exports = { askQuestions, getDefaults };
