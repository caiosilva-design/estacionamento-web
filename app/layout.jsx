export const metadata = {
 title: "Estacionamento",
 description: "Sistema de estacionamento",
};
export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
<html lang="pt-BR">
<body>{children}</body>
</html>
 );
}
