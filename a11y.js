const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html);

global.window = dom.window;
global.Node = dom.window.Node;
global.Element = dom.window.Element;
global.document = dom.window.document;

const axe = require('axe-core');

aXeRun();

function aXeRun(){
  axe.run(global.document).then(results => {
    if (results.violations.length) {
      console.error('Accessibility violations:');
      results.violations.forEach(v => {
        console.error(`- ${v.id}: ${v.help}`);
        v.nodes.forEach(node => {
          console.error(`  Selector: ${node.target.join(' ')}`);
        });
      });
      process.exit(1);
    } else {
      console.log('No accessibility violations found.');
    }
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
