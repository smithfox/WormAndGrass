require('esbuild').build(
{
    entryPoints: ['ts/Program.ts'],
    outdir: './js',
    bundle: true,
    define: { "process.env.NODE_ENV": '"production"' },
    watch: true
})