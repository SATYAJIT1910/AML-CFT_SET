'use strict';
const { WorkloadModuleBase, TxStatus } = require('@hyperledger/caliper-core');

/**
 * Workload module for the benchmark round.
 */
class GetProjectWorkload extends WorkloadModuleBase {
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
        const projectId = '100';

        let args = {
            contractId: 'crowdfund',
            contractVersion: 'v1',
            contractFunction: 'PrimaryContract:getProject',
            contractArguments: [projectId],
            timeout: 30
        };

        const result = await this.sutAdapter.sendRequests(args);
        return [new TxStatus(projectId, result)];
    }
}

/**
 * Create a new instance of the workload module.
 * @return {WorkloadModuleInterface}
 */
function createWorkloadModule() {
    return new GetProjectWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
