'use strict';

const { Contract } = require('fabric-contract-api');

class PrimaryContract extends Contract {
	async initLedger(ctx) {
	    console.info('============= Initialize Ledger ===========');
	}

    async createProject(ctx, projectId, projectName, projectDescription, fundingGoal) {
        let project = {
            projectId: projectId,
            projectName: projectName,
            projectDescription: projectDescription,
            fundingGoal: fundingGoal,
            contributions: {},
            status: 'CREATED'
        };
        await ctx.stub.putState(projectId, Buffer.from(JSON.stringify(project)));
        return JSON.stringify(project);
    }

    async contributeToProject(ctx, projectId, contributorId, ssi, amount) {
        let projectAsBytes = await ctx.stub.getState(projectId);
        if (!projectAsBytes || projectAsBytes.length === 0) {
            throw new Error(`Project with ID ${projectId} does not exist`);
        }
        let project = JSON.parse(projectAsBytes.toString());
        if (project.status !== 'CREATED') {
            throw new Error(`Project with ID ${projectId} is not open for contributions`);
        }
        if (!project.contributions[contributorId]) {
            project.contributions[contributorId] = {
                ssi: ssi,
                amount: 0
            };
        }
        project.contributions[contributorId].amount += amount;
        await ctx.stub.putState(projectId, Buffer.from(JSON.stringify(project)));
        return JSON.stringify(project);
    }

    async completeProject(ctx, projectId) {
        let projectAsBytes = await ctx.stub.getState(projectId);
        if (!projectAsBytes || projectAsBytes.length === 0) {
            throw new Error(`Project with ID ${projectId} does not exist`);
        }
        let project = JSON.parse(projectAsBytes.toString());
        if (project.status !== 'CREATED') {
            throw new Error(`Project with ID ${projectId} is not open for completion`);
        }
        let totalContributions = Object.values(project.contributions).reduce((total, contribution) => total + contribution.amount, 0);
        if (totalContributions >= project.fundingGoal) {
            project.status = 'COMPLETED';
        } else {
            throw new Error(`Project with ID ${projectId} is not fully funded`);
        }
        await ctx.stub.putState(projectId, Buffer.from(JSON.stringify(project)));
        return JSON.stringify(project);
    }

    async rewardContributors(ctx, projectId, contributorIds) {
        let projectAsBytes = await ctx.stub.getState(projectId);
        if (!projectAsBytes || projectAsBytes.length === 0) {
            throw new Error(`Project with ID ${projectId} does not exist`);
        }
        let project = JSON.parse(projectAsBytes.toString());
        if (project.status !== 'COMPLETED') {
            throw new Error(`Project with ID ${projectId} is not completed`);
        }
        let totalRewards = project.fundingGoal / contributorIds.length;
        for (let contributorId of contributorIds) {
            if (project.contributions[contributorId]) {
                project.contributions[contributorId].amount += totalRewards;
            } else {
                throw new Error(`Contributor with ID ${contributorId} did not contribute to project ${projectId}`);
            }
        }
        await ctx.stub.putState(projectId, Buffer.from(JSON.stringify(project)));
        return JSON.stringify(project);
    }

    async getProject(ctx, projectId) {
        let projectAsBytes = await ctx.stub.getState(projectId);
        if (!projectAsBytes || projectAsBytes.length === 0) {
            throw new Error(`Project with ID ${projectId} does not exist`);
        }
        let project = JSON.parse(projectAsBytes.toString());
        return JSON.stringify(project);
    }

    async storeSSI(ctx, userId, ssi) {
        let userAsBytes = await ctx.stub.getState(userId);
        let user = userAsBytes ? JSON.parse(userAsBytes.toString()) : {};
        user.userId = userId;
        user.ssi = ssi;
        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));
        return JSON.stringify(user);
    }

    async getSSI(ctx, userId) {
        let userAsBytes = await ctx.stub.getState(userId);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User with ID ${userId} does not exist`);
        }
        let user = JSON.parse(userAsBytes.toString());
        return JSON.stringify(user.ssi);
    }
}

module.exports = PrimaryContract;

