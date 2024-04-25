
'use strict';
const { WorkloadModuleBase, TxStatus } = require('@hyperledger/caliper-core');

/**
 * Workload module for the benchmark round.
 */
class CreateProjectWorkload extends WorkloadModuleBase {
    /**
     * Initializes the workload module instance.
     */
    constructor() {
        super();
        this.txIndex = 0;
    }

    /**
     * Assemble TXs for the round.
     * @return {Promise<TxStatus[]>}
     */
    async submitTransaction() {
        this.txIndex++;
        const projectId = `proj${this.txIndex}_test`;
        const projectName = `Project ${this.txIndex}`;
        const projectDescription = `Description for Project ${this.txIndex}`;
        const fundingGoal = 1000;

        let input = {
            "projectId": projectId,
            "projectName": projectName,
            "projectDescription": projectDescription,
            "fundingGoal": fundingGoal,
        };

        let args = {
            contractId: 'crowdfund',
            contractVersion: 'v1',
            contractFunction: 'PrimaryContract:createProject',
            contractArguments: [JSON.stringify(input)],
            timeout: 30
        };

        await this.sutAdapter.sendRequests(args);
        return [new TxStatus(input.projectId, true)];
    }
}

/**
 * Create a new instance of the workload module.
 * @return {WorkloadModuleInterface}
 */
function createWorkloadModule() {
    return new CreateProjectWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;

