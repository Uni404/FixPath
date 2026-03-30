const bcrypt = require('bcrypt');

async function main() {
    const experts = [
        { id: 1, password: 'expert123' },
        { id: 2, password: 'expert456' }
    ];

    for (const expert of experts) {
        const hash = await bcrypt.hash(expert.password, 10);
        console.log(`Expert ${expert.id}: ${hash}`);
    }
}

main();