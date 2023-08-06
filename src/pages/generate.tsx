import { type NextPage } from "next";
import { useState } from "react";
import Image from "next/image";
import { Input } from "~/components/Input";
import { FormGroup } from "~/components/FormGroup";
import { api } from "~/utils/api";
import { Button } from "~/components/Button";

const colors = [
  "red",
  "blue",
  "pink",
  "green",
  "orange",
  "yellow",
  "white",
  "black",
];

const GeneratePage: NextPage = () => {
  const [form, setForm] = useState({
    prompt: "",
    color: "",
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
    generateImage.mutate(form);
  }

  return (
    <>
      <main className="mx-auto mt-24 flex min-h-screen flex-col justify-center px-8">
        <h1 className="text-6xl">Generate your images!</h1>
        <p className="mb-12 text-2xl">
          Fill out the form below to start generating your own assets.
        </p>
        <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
          <h2 className="text-xl">1. Describe what your image to look like</h2>
          <FormGroup className="mb-12">
            <label>Prompt</label>
            <Input value={form.prompt} onChange={updateForm("prompt")}></Input>
          </FormGroup>

          <h2 className="text-xl">2. Pick colors</h2>
          <FormGroup className="mb-12 grid grid-cols-4">
            {colors.map((color) => (
              <label className="flex gap-2 text-2xl">
                <input
                  type="radio"
                  name="color"
                  checked={color === form.color}
                  onChange={() => setForm((prev) => ({ ...prev, color }))}
                ></input>
                {color}
              </label>
            ))}
          </FormGroup>

          <Button
            isLoading={generateImage.isLoading}
            disabled={generateImage.isLoading}
          >
            Submit
          </Button>
        </form>
        {imageUrl && (
          <>
            <h2 className="text-xl">Your generated images!</h2>
            <section className="grid grid-cols-4 gap-4">
              <Image
                src={imageUrl}
                alt={"An image of:" + form.prompt}
                width="100"
                height="100"
                className="w-full"
              />
            </section>
          </>
        )}
      </main>
    </>
  );
};

export default GeneratePage;
