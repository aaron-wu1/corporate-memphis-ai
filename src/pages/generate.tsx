import { type NextPage } from "next";
import { useState } from "react";
import { Input } from "~/components/Input";
import { FormGroup } from "~/components/FormGroup";
import { api } from "~/utils/api";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "~/components/Button";
const GeneratePage: NextPage = () => {
  const [form, setForm] = useState({
    prompt: "",
  });

  function updateForm(key: string) {
    return function (e: React.ChangeEvent<HTMLInputElement>) {
      setForm((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));
    };
  }
  const generateIcon = api.generate.generateIcon.useMutation({
    onSuccess(data) {
      console.log("mutation finished", data);
    },
  });

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault(); // preventing page refresh
    // TODO: submit the form data to the backend
    generateIcon.mutate({
      prompt: form.prompt,
    });
  }

  const session = useSession();

  const isLoggedIn = !!session.data;

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center">
        {!isLoggedIn && (
          <Button
            onClick={() => {
              signIn().catch(console.error);
            }}
          >
            Login
          </Button>
        )}
        {isLoggedIn && (
          <Button
            onClick={() => {
              signOut().catch(console.error);
            }}
          >
            Logout
          </Button>
        )}
        {session.data?.user.name}
        <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
          <FormGroup>
            <label>Prompt</label>
            <Input value={form.prompt} onChange={updateForm("prompt")}></Input>
          </FormGroup>
          <Button className="rounded bg-blue-400 px-4 py-2 hover:bg-blue-500">
            Submit
          </Button>
        </form>
      </main>
    </>
  );
};

export default GeneratePage;