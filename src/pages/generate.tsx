import { type NextPage } from "next";
import { useState } from "react";
import Image from "next/image";
import { Input } from "~/components/Input";
import { FormGroup } from "~/components/FormGroup";
import { api } from "~/utils/api";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "~/components/Button";

const GeneratePage: NextPage = () => {
  const [form, setForm] = useState({
    prompt: "",
  });
  const [imageUrl, setImageUrl] = useState("");

  function updateForm(key: string) {
    return function (e: React.ChangeEvent<HTMLInputElement>) {
      setForm((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));
    };
  }
  const generateImage = api.generate.generateImage.useMutation({
    onSuccess(data) {
      if (!data.imageUrl) return;
      setImageUrl(data.imageUrl);
    },
  });

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault(); // preventing page refresh
    generateImage.mutate({
      prompt: form.prompt,
    });
    setForm({ prompt: "" });
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
        <Image
          src={imageUrl}
          alt={"An image of:" + form.prompt}
          width={500}
          height={500}
        />
      </main>
    </>
  );
};

export default GeneratePage;
