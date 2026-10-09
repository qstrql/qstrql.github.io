# qstrql.github.io

My portfolio. Plain HTML/CSS/JS, served by GitHub Pages straight from `main`, with no build step.

- `index.html`: home page with about section and project cards
- `projects/push_swap.html`: push_swap write-up plus a live visualiser running my C code compiled to WebAssembly

## Rebuild the push_swap WASM
```sh
source ~/emsdk/emsdk_env.sh
./build_push_swap.sh ../push_swap   # path to the push_swap repo; also checks that it sorts
```

## Run locally
`python3 -m http.server`, then open http://localhost:8000. WASM doesn't load over `file://`.
