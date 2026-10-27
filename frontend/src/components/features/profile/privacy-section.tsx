"use client";

import { AlertCircle, Download, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { FormField } from "@/components/common/form-field";
import { PasswordInput } from "@/components/common/password-input";
import { useAuth } from "@/components/features/auth/auth-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { deleteMyAccount, exportMyData } from "@/lib/api/profile";
import { ACCOUNT_DELETED_PARAM, ACCOUNT_DELETED_VALUE, LOGIN_PATH } from "@/lib/navigation";

// Baixar os próprios dados (LGPD art. 18, DEC-095): o JSON vem da API e vira
// um arquivo no navegador, sem passar por outro serviço.
function ExportData() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setPending(true);
    setError(null);
    try {
      const data = await exportMyData();
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "ecobyte-meus-dados.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(exportError instanceof ApiError ? exportError.message : "Não foi possível baixar seus dados. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <h3 className="font-medium">Baixar meus dados</h3>
        <p className="text-sm text-muted-foreground">
          Um arquivo com tudo o que o EcoByte guarda sobre você: perfil, coletas e notificações.
        </p>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button variant="outline" onClick={handleExport} loading={pending} className="w-full sm:w-auto sm:justify-self-start">
        {!pending && <Download aria-hidden="true" data-icon="inline-start" />}
        {pending ? "Preparando..." : "Baixar meus dados"}
      </Button>
    </div>
  );
}

// Excluir a conta (DEC-095): pede a senha de novo e explica o que acontece.
function DeleteAccount() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const passwordId = useId();
  const [open, setOpen] = useState(false);
  const [senha, setSenha] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleOpenChange(next: boolean) {
    if (pending) return;
    setOpen(next);
    if (!next) {
      setSenha("");
      setFieldError(null);
      setFormError(null);
    }
  }

  async function handleDelete() {
    if (!senha) {
      setFieldError("Informe a sua senha.");
      return;
    }
    setPending(true);
    setFieldError(null);
    setFormError(null);
    try {
      await deleteMyAccount(senha);
      // A sessão foi encerrada pela API: o estado de autenticação é recarregado.
      await refreshUser();
      router.replace(`${LOGIN_PATH}?${ACCOUNT_DELETED_PARAM}=${ACCOUNT_DELETED_VALUE}`);
    } catch (error) {
      if (error instanceof ApiError && error.fields.senha) setFieldError(error.fields.senha);
      else setFormError(error instanceof ApiError ? error.message : "Não foi possível excluir a conta. Tente novamente.");
      setPending(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <h3 className="font-medium">Excluir minha conta</h3>
        <p className="text-sm text-muted-foreground">
          Seu nome, e-mail e telefone são apagados e você sai de todos os dispositivos. A ação não pode ser desfeita.
        </p>
      </div>
      <Button variant="destructive" onClick={() => setOpen(true)} className="w-full sm:w-auto sm:justify-self-start">
        <Trash2 aria-hidden="true" data-icon="inline-start" />
        Excluir minha conta
      </Button>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir sua conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Seus dados pessoais são removidos e o acesso é encerrado. As coletas concluídas ficam no histórico da
              operação, sem o seu nome e sem o endereço completo. Coletas em andamento impedem a exclusão.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {formError && (
            <Alert variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <FormField id={passwordId} label="Confirme com a sua senha" required error={fieldError ?? undefined}>
            <PasswordInput
              autoComplete="current-password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleDelete();
              }}
            />
          </FormField>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <Button variant="destructive" loading={pending} onClick={() => void handleDelete()}>
              {pending ? "Excluindo..." : "Excluir conta"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Seção "Seus dados" do perfil (DEC-095). O administrador baixa os dados, mas
// não exclui a conta pelo perfil: ela mantém o sistema operável.
export function PrivacySection({ canDelete }: { canDelete: boolean }) {
  return (
    <div className="grid gap-6">
      <ExportData />
      {canDelete ? (
        <DeleteAccount />
      ) : (
        <p className="text-sm text-muted-foreground">A conta de administrador não pode ser excluída pelo perfil.</p>
      )}
    </div>
  );
}
