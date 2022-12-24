require('esbuild').build(
{
    entryPoints: ['ts/Program.ts', 'ts/GamePixi.ts', 'ts/WorldMap.ts'],
    outdir: './js',
    bundle: true,
    define: { "process.env.NODE_ENV": '"production"' },
    watch: true
})