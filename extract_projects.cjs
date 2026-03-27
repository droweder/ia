const fs = require('fs');
const blobs = fs.readFileSync('lost_blobs.txt', 'utf8').split('\n').filter(Boolean);
const execSync = require('child_process').execSync;

for (const blob of blobs) {
    try {
        const content = execSync(`git show ${blob}`).toString();
        if (content.includes('Meus Projetos') && content.includes('export default Projects')) {
            fs.writeFileSync('src/pages/Projects.tsx', content);
            console.log(`Recovered from blob ${blob}`);
            break;
        }
    } catch (e) {
        // ignore
    }
}
