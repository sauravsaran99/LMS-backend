const { Test, BranchTestPrice } = require('./src/models');
const { getPaginationParams, getPaginatedResponse } = require("./src/utils/pagination.util");

async function verifyLogic(branchIdStr) {
    console.log(`\n\n--- Testing with Branch ID: ${branchIdStr} ---`);

    const options = {};
    const targetBranchId = branchIdStr || 1; // Default to Mumbai Central if null

    if (targetBranchId) {
        options.include = [{
            model: BranchTestPrice,
            required: false,
            where: { branch_id: targetBranchId }
        }];
    }

    const tests = await Test.findAll(options);

    console.log(`Found ${tests.length} tests.`);

    const processedTests = tests.map(test => {
        const testJson = test.toJSON();
        const originalPrice = testJson.price;
        let finalPrice = originalPrice;
        let overridden = false;

        if (testJson.BranchTestPrices && testJson.BranchTestPrices.length > 0) {
            finalPrice = testJson.BranchTestPrices[0].price;
            overridden = true;
        }

        if (test.name.includes("Blood")) {
            console.log(`Test: ${test.name} | Original: ${originalPrice} | Final: ${finalPrice} | Overridden: ${overridden}`);
            if (testJson.BranchTestPrices) console.log('BranchTestPrices:', JSON.stringify(testJson.BranchTestPrices));
        }
        return testJson;
    });
}

async function run() {
    // 1. Simulate Andheri (ID 128) - Should have 40
    await verifyLogic(128);

    // 2. Simulate Andheri East (ID 2) - Should have 30
    await verifyLogic(2);

    // 3. Simulate Branch with no overrides (e.g. ID 999) - Should have Default
    await verifyLogic(999);

    process.exit();
}

run();
