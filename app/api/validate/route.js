import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req) {
  try {
    const { optimalCode, bruteCode, testGenCode } = await req.json();

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'problem-settler-'));
    const genPath = path.join(tempDir, 'gen.py');
    const optPath = path.join(tempDir, 'opt.cpp');
    const brutePath = path.join(tempDir, 'brute.cpp');
    const optBin = path.join(tempDir, 'opt.out');
    const bruteBin = path.join(tempDir, 'brute.out');

    await fs.writeFile(genPath, testGenCode);
    await fs.writeFile(optPath, optimalCode);
    await fs.writeFile(brutePath, bruteCode);

    // Run test generator
    const { stdout: testInput } = await execAsync(`python3 ${genPath}`);

    // Compile C++
    await execAsync(`g++ -O3 ${optPath} -o ${optBin}`);
    await execAsync(`g++ -O3 ${brutePath} -o ${bruteBin}`);

    // Run Optimal
    const { stdout: optOutput } = await execAsync(`${optBin}`, { input: testInput });

    // Run Brute (may take longer, adding a small timeout)
    const { stdout: bruteOutput } = await execAsync(`${bruteBin}`, { input: testInput, timeout: 5000 });

    // Clean up
    await fs.rm(tempDir, { recursive: true, force: true });

    const passed = optOutput.trim() === bruteOutput.trim();

    return NextResponse.json({ passed, optOutput: optOutput.trim(), bruteOutput: bruteOutput.trim() });
  } catch (error) {
    console.error('Validation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
