import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet, localhost } from 'viem/chains';

// HARDHAT ACCOUNT #0 (Admin/Minter)
const PVT_KEY = process.env.ADMIN_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { contributionId, address } = await req.json();

    const contribution = await prisma.contributionEvent.findUnique({
        where: { id: contributionId },
        include: { project: true },
    });

    if (!contribution) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (contribution.mintStatus !== 'READY_TO_MINT') {
        return NextResponse.json({ error: 'Not eligible for minting' }, { status: 403 });
    }

    // Domain data matches Smart Contract
    const domain = {
        name: 'ContribMint',
        version: '1',
        chainId: 1337, // Localhost
        verifyingContract: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`,
    };

    const types = {
        Voucher: [
            { name: "projectId", type: "string" },
            { name: "prId", type: "string" },
            { name: "metadataUri", type: "string" },
            { name: "minter", type: "address" },
        ],
    };

    const voucher = {
        projectId: contribution.project.id,
        prId: contribution.id, // Using internal ID as PR ID for uniqueness in this MVP
        metadataUri: `https://contribmint.com/api/metadata/${contribution.id}`, // Mock URI
        minter: address,
    };

    const account = privateKeyToAccount(PVT_KEY as `0x${string}`);

    const client = createWalletClient({
        account,
        chain: localhost,
        transport: http()
    });

    // Sign Typed Data
    const signature = await client.signTypedData({
        account,
        domain,
        types,
        primaryType: 'Voucher',
        message: voucher
    });

    return NextResponse.json({ voucher, signature });
}
