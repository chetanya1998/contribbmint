'use client';

import { useWriteContract, useAccount } from 'wagmi';
import { useState } from 'react';
import axios from 'axios';

// ABI partial for redeem
const CONTRIB_ABI = [
    {
        type: 'function',
        name: 'redeem',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'voucher',
                type: 'tuple',
                components: [
                    { name: 'projectId', type: 'string' },
                    { name: 'prId', type: 'string' },
                    { name: 'metadataUri', type: 'string' },
                    { name: 'minter', type: 'address' }
                ]
            },
            { name: 'signature', type: 'bytes' }
        ],
        outputs: []
    }
] as const;

// CONTRACT ADDRESS - Replace with Env Var or deployed address
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Localhost default

export function ClaimButton({ contributionId }: { contributionId: string }) {
    const { isConnected } = useAccount();
    const { writeContract, isPending } = useWriteContract();
    const [loading, setLoading] = useState(false);

    const handleClaim = async () => {
        if (!isConnected) return alert('Connect wallet first');
        setLoading(true);

        try {
            // 1. Get Voucher from Backend
            const { address } = (window as any).ethereum ? await (window as any).ethereum.request({ method: 'eth_requestAccounts' }).then((accounts: any) => ({ address: accounts[0] })) : { address: '' };
            // Better: use useAccount address.
            // But for backend API we need the address.

            // 1. Get Voucher from Backend
            const { data } = await axios.post('/api/mint/signature', { contributionId, address: '0x...' }); // We need real address.
            // Wait, useAccount hook gives address.

            // Re-implementing correctly below in return
        } catch (e) { }
    }

    // Correct implementation closure
    return (
        <ClaimButtonInner contributionId={contributionId} />
    )
}

function ClaimButtonInner({ contributionId }: { contributionId: string }) {
    const { isConnected, address } = useAccount();
    const { writeContract, isPending } = useWriteContract();
    const [loading, setLoading] = useState(false);

    const handleClaim = async () => {
        if (!isConnected || !address) return alert('Connect wallet first');
        setLoading(true);

        try {
            // 1. Get Voucher from Backend
            const { data } = await axios.post('/api/mint/signature', { contributionId, address });
            const { voucher, signature } = data;

            // 2. Call Contract
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRIB_ABI,
                functionName: 'redeem',
                args: [voucher, signature],
            } as any, {
                onSuccess: () => alert('Mint Submitted!'),
                onError: (err) => alert(err.message),
            });

        } catch (err: any) {
            console.error(err);
            alert('Failed to get signature: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClaim}
            disabled={!isConnected || loading || isPending}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
            {loading || isPending ? 'Minting...' : 'Claim NFT'}
        </button>
    );
}
