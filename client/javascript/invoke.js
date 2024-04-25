'use strict';

const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const { resolve, join } = require('path');
const {readFileSync} = require('fs')
const body_parser=require('body-parser')
const app = express();
const port = 3000;
app.use(body_parser.urlencoded({ extended: true }))
// Path to the wallet
const walletPath = join(__dirname, 'wallet');

// Define the connection profile (ccp)
const ccpPath = resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
const ccpJSON = readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);



async function connectToNetwork() {
    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet: await Wallets.newFileSystemWallet(walletPath),
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true }
    });
    return gateway;
}




// Create project
app.post('/api/createProject', async (req, res) => {
    try {
        const gateway = await connectToNetwork();
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('CROWDFUND');
        
        await contract.submitTransaction('PrimaryContract:createProject', req.body.projectId, req.body.projectName, req.body.projectDescription, req.body.fundingGoal);
        res.send('Project created successfully');
    } catch (error) {
        console.error(`Failed to create project: ${error}`);
        res.status(500).send('Failed to create project');
    }
});

// Contribute to project
app.post('/api/contributeToProject', async (req, res) => {
    try {
        const gateway = await connectToNetwork();
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('CROWDFUND');
        await contract.submitTransaction('PrimaryContract:contributeToProject', req.body.projectId, req.body.contributorId, req.body.ssi, req.body.amount);
        res.send('Contribution added successfully');
    } catch (error) {
        console.error(`Failed to contribute to project: ${error}`);
        res.status(500).send('Failed to contribute to project');
    }
});

// Complete project
app.post('/api/completeProject', async (req, res) => {
    try {
        const gateway = await connectToNetwork();
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('CROWDFUND');
        await contract.submitTransaction('PrimaryContract:completeProject', req.body.projectId);
        res.send('Project completed successfully');
    } catch (error) {
        console.error(`Failed to complete project: ${error}`);
        res.status(500).send('Failed to complete project');
    }
});

// Reward contributors
app.post('/api/rewardContributors', async (req, res) => {
    try {
        const gateway = await connectToNetwork();
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('CROWDFUND');
        await contract.submitTransaction('PrimaryContract:rewardContributors', req.body.projectId, req.body.contributorIds);
        res.send('Contributors rewarded successfully');
    } catch (error) {
        console.error(`Failed to reward contributors: ${error}`);
        res.status(500).send('Failed to reward contributors');
    }
});

// Get project details
app.get('/api/getProject', async (req, res) => {
    try {
        const gateway = await connectToNetwork();
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('CROWDFUND');
        const result = await contract.evaluateTransaction('PrimaryContract:getProject', req.body.projectId);
        res.send(result.toString());
    } catch (error) {
        console.error(`Failed to get project details: ${error}`);
        res.status(500).send('Failed to get project details');
    }
});

// Store SSI
app.post('/api/storeSSI', async (req, res) => {
    try {
        const gateway = await connectToNetwork();
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('CROWDFUND');
        await contract.submitTransaction('PrimaryContract:storeSSI', req.body.userId, req.body.ssi);
        res.send('SSI stored successfully');
    } catch (error) {
        console.error(`Failed to store SSI: ${error}`);
        res.status(500).send('Failed to store SSI');
    }
});

// Get SSI
app.get('/api/getSSI', async (req, res) => {
    try {
        const gateway = await connectToNetwork();
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('CROWDFUND');
        const result = await contract.evaluateTransaction('PrimaryContract:getSSI', req.body.userId);
        res.send(result.toString());
    } catch (error) {
        console.error(`Failed to get SSI: ${error}`);
        res.status(500).send('Failed to get SSI');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

