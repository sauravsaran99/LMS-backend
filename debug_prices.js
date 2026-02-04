const { Branch, Test, BranchTestPrice } = require('./src/models');
const { Op } = require('sequelize');

async function debug() {
    console.log('--- Debugging Branch Prices ---');

    // 1. Find Branches matching "Andheri"
    const branches = await Branch.findAll({
        where: {
            name: { [Op.like]: '%Andheri%' }
        }
    });

    console.log(`\nFound ${branches.length} branches matching "Andheri":`);
    branches.forEach(b => console.log(`- ID: ${b.id}, Name: ${b.name}`));

    // 2. Find Tests matching "Blood"
    const tests = await Test.findAll({
        where: {
            name: { [Op.like]: '%Blood%' }
        }
    });

    console.log(`\nFound ${tests.length} tests matching "Blood":`);
    tests.forEach(t => console.log(`- ID: ${t.id}, Name: ${t.name}, Default Price: ${t.price}`));

    // 3. Check Prices for these combinations
    if (branches.length > 0 && tests.length > 0) {
        console.log('\nChecking BranchTestPrice entries:');

        const branchIds = branches.map(b => b.id);
        const testIds = tests.map(t => t.id);

        const prices = await BranchTestPrice.findAll({
            where: {
                branch_id: branchIds,
                test_id: testIds
            }
        });

        if (prices.length === 0) {
            console.log('No specific prices found for these combinations.');
        } else {
            prices.forEach(p => {
                console.log(`- Branch ID: ${p.branch_id} -> Test ID: ${p.test_id}: Price = ${p.price}`);
            });
        }
    }

    process.exit();
}

debug();
