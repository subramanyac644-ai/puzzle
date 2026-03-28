import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@core-hubble/shared/prisma';
import { getAuthUser } from '@core-hubble/shared/auth';

async function ensureAdmin(req: NextRequest) {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== 'admin') return null;
    return auth;
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await ensureAdmin(req);
    if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    
    if (id === auth.userId) {
        return NextResponse.json({ error: 'You cannot delete your own admin account' }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        if (user.role === 'admin') return NextResponse.json({ error: 'Admin accounts cannot be deleted' }, { status: 400 });

        await prisma.score.deleteMany({ where: { userId: id } });
        await prisma.user.delete({ where: { id } });
        
        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
