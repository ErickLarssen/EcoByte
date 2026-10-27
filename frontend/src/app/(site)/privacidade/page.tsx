import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteSection } from "@/components/features/site/site-blocks";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Quais dados o EcoByte trata, para quê, com quem e como você exerce os seus direitos de titular (LGPD).",
};

// Data desta versão do texto. Mudanças relevantes devem atualizá-la.
const UPDATED_AT = "26 de outubro de 2026";

function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="grid list-disc gap-2 pl-5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid gap-3">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

const LINK = "font-medium text-primary underline-offset-4 hover:underline";

// Política de Privacidade (LGPD, DEC-095). Cada afirmação descreve o que o
// sistema faz de fato (09 §67–§71, DEC-070, DEC-086, DEC-091 a DEC-095). Pontos
// ainda não definidos, como o canal de contato (OQ-046) e prazos de retenção
// além da exclusão da conta (OQ-039), não são inventados.
export default function PrivacidadePage() {
  return (
    <SiteSection
      id="politica"
      eyebrow="Privacidade"
      title="Política de Privacidade"
      description={`Como o EcoByte trata os seus dados pessoais, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Atualizada em ${UPDATED_AT}.`}
    >
      <div className="grid max-w-3xl gap-10 text-muted-foreground">
        <Block title="1. Quais dados tratamos">
          <List
            items={[
              <>
                <strong className="text-foreground">Conta:</strong> nome, e-mail, telefone (opcional), tipo de cadastro e, para
                empresas e instituições, razão social e nome fantasia. A senha nunca é guardada: só um resumo
                criptográfico irreversível (Argon2id).
              </>,
              <>
                <strong className="text-foreground">Coletas:</strong> endereço de coleta, itens, observações e a data de cada
                etapa.
              </>,
              <>
                <strong className="text-foreground">Notificações</strong> sobre o andamento das suas coletas.
              </>,
              <>
                <strong className="text-foreground">Dados técnicos de segurança:</strong> um cookie de sessão; o endereço IP,
                usado em memória por alguns minutos para limitar tentativas e não guardado; e, após senhas erradas, um
                registro temporário com o e-mail em forma de resumo criptográfico, apagado em até 30 minutos.
              </>,
            ]}
          />
        </Block>

        <Block title="2. Para que usamos">
          <List
            items={[
              "Criar e proteger a sua conta e confirmar o seu e-mail.",
              "Realizar a coleta: o coletor precisa do endereço e de um contato.",
              "Avisar você sobre cada etapa da coleta.",
              "Proteger o sistema contra acessos indevidos e abusos.",
            ]}
          />
          <p>
            O tratamento é necessário para prestar o serviço que você solicita (LGPD, art. 7º, V) e para a segurança do
            sistema (art. 7º, IX). Não vendemos dados, não os usamos para publicidade e não usamos cookies de
            rastreamento nem ferramentas de análise de terceiros.
          </p>
        </Block>

        <Block title="3. Quem acessa">
          <List
            items={[
              "Você: todos os seus dados, no seu perfil.",
              "Coletores: nas coletas disponíveis, veem endereço, itens e observações, sem o seu nome e telefone. Depois que um coletor aceita a sua coleta, só ele vê também o seu nome e telefone.",
              "Administração do EcoByte: os dados necessários à operação. Ações sensíveis, como ativar ou desativar contas, ficam registradas em auditoria.",
            ]}
          />
        </Block>

        <Block title="4. Serviços que tratam dados em nosso nome">
          <p>
            Para funcionar, o EcoByte usa provedores que tratam dados apenas para executar o serviço, com os servidores
            localizados nos Estados Unidos (transferência internacional, LGPD art. 33):
          </p>
          <List
            items={[
              "Vercel: hospedagem do site.",
              "Render: servidor da aplicação.",
              "MongoDB Atlas: banco de dados, com criptografia em trânsito e em repouso.",
              "Provedor de envio de e-mails: e-mails de confirmação e de redefinição de senha.",
              "ViaCEP: consulta do endereço a partir do CEP; só o CEP é enviado.",
              "Google Maps: somente quando você ou o coletor usa “Como chegar”; o endereço vai no link aberto.",
            ]}
          />
        </Block>

        <Block title="5. Como protegemos">
          <List
            items={[
              "Conexões sempre por HTTPS e cookie de sessão protegido contra leitura por scripts.",
              "Senhas e links de confirmação guardados só como resumos criptográficos.",
              "Bloqueio temporário após muitas tentativas de login e sessões encerradas ao trocar a senha.",
              "Cada perfil só acessa o que precisa, com as permissões conferidas no servidor.",
            ]}
          />
        </Block>

        <Block title="6. Por quanto tempo">
          <p>
            Os dados ficam enquanto a sua conta existir. Ao excluir a conta, nome, e-mail, telefone e dados da empresa são
            removidos na hora, assim como as suas notificações. As coletas concluídas ficam no histórico da operação sem
            identificar você: o endereço completo é apagado e restam só bairro, cidade e UF. Os registros de auditoria não
            contêm dados pessoais.
          </p>
        </Block>

        <Block title="7. Seus direitos">
          <List
            items={[
              <>
                <strong className="text-foreground">Acesso e portabilidade:</strong> em{" "}
                <span className="text-foreground">Meu perfil › Seus dados › Baixar meus dados</span>, você recebe um arquivo
                com tudo o que guardamos sobre você.
              </>,
              <>
                <strong className="text-foreground">Correção:</strong> nome e telefone podem ser alterados no seu perfil.
              </>,
              <>
                <strong className="text-foreground">Eliminação:</strong> em{" "}
                <span className="text-foreground">Meu perfil › Seus dados › Excluir minha conta</span>. Coletas em andamento
                precisam ser concluídas antes.
              </>,
              "Informação sobre com quem compartilhamos: os serviços da seção 4.",
            ]}
          />
          <p>
            Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).
          </p>
        </Block>

        <Block title="8. Cookies">
          <p>
            Usamos apenas o cookie de sessão, essencial para manter você conectado. Ele não é acessível por scripts,
            expira sozinho e não é compartilhado com terceiros.
          </p>
        </Block>

        <p className="text-sm">
          Dúvidas sobre o serviço? Veja <Link href="/como-funciona" className={LINK}>Como funciona</Link>.
        </p>
      </div>
    </SiteSection>
  );
}
