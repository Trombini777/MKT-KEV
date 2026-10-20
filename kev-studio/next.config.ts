import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O Studio vive dentro do repositório do Sistema de Marketing, que tem o próprio lockfile.
  // Fixar a raiz evita que o Turbopack trate a pasta pai como raiz do projeto.
  turbopack: { root: __dirname },
};

export default nextConfig;
