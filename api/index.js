import express from 'express';
import cors from 'cors';
import { ethers, isAddress } from 'ethers';

const app = express();
const port = 3000;

// Konfigurasi CORS
app.use(cors());

// Konfigurasi provider menggunakan RPC publik Linea
const provider = new ethers.JsonRpcProvider('https://rpc.linea.build');

// ABI dari fungsi balanceOf untuk mengecek saldo NFT berdasarkan ID
const contractABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "account", "type": "address" },
            { "internalType": "uint256", "name": "id", "type": "uint256" }
        ],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];
const contractAddress = '0x0872ec4426103482a50f26ffc32acefcec61b3c9';

// Fungsi untuk mengecek kepemilikan NFT berdasarkan alamat
async function checkNFTs(address) {
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const nftIds = [1, 2, 3, 4, 5]; // ID NFT yang ingin dicek
    const results = {};

    for (let id of nftIds) {
        try {
            const balance = await contract.balanceOf(address, id);
            results[id] = Number(balance) > 0; // `true` jika memiliki, `false` jika tidak
        } catch (error) {
            console.error(`Error checking NFT ID ${id}:`, error);
            results[id] = false; // Set false jika terjadi error
        }
    }
    return results;
}

// Endpoint untuk mengecek kepemilikan NFT berdasarkan alamat
app.get('/api/', async (req, res) => {
    const { address } = req.query;
    if (!isAddress(address)) {
        return res.status(400).json({ error: 'Invalid address' });
    }

    try {
        const nftHoldings = await checkNFTs(address);
        res.json(nftHoldings);
    } catch (error) {
        console.error('Error checking NFTs:', error);
        res.status(500).json({ error: 'Failed to check NFT holdings' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`NFT Checker API is running on http://localhost:${port}`);
});
