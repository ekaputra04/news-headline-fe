"use client";

import { Cover } from "@/components/ui/cover";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CSSProperties, useState } from "react";
import { HashLoader } from "react-spinners";

const formSchema = z.object({
  url: z
    .string()
    .url("Link harus berupa URL yang valid")
    .refine((val) => val.startsWith("https://"), {
      message: "Link harus diawali dengan https://",
    }),
});

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

interface ResponseDataInterface {
  content: string;
  summary: string;
}

export default function HomePage() {
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<ResponseDataInterface | null>(null);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      console.log(values);

      const response = await fetch(`http://127.0.0.1:5000/extract-news`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Gagal mengirim permintaan");
      }

      const data: ResponseDataInterface = await response.json();
      setData(data);
      console.log("Respon dari server:", data);
      // Lakukan sesuatu dengan data jika perlu
    } catch (error) {
      console.error("Terjadi kesalahan saat mengirim data:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-8 md:px-16 lg:px-32 xl:px-48 py-8">
      <h1 className="z-20 relative bg-clip-text bg-gradient-to-b from-neutral-800 dark:from-neutral-800 via-neutral-700 dark:via-white to-neutral-700 dark:to-white mx-auto mt-6 py-6 max-w-7xl font-semibold text-transparent text-xl md:text-2xl lg:text-4xl text-center">
        Read Faster <br /> with <Cover>Text Summarization</Cover>
      </h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex justify-center gap-4 space-y-8 mt-8"
        >
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Input URL..."
                    {...field}
                    className="w-64"
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Summarize"}
          </Button>
        </form>
      </Form>
      <div className="gap-16 grid grid-cols-1 md:grid-cols-5">
        {loading ? (
          <>
            <HashLoader
              color={"#22c55e"}
              loading={loading}
              cssOverride={override}
              size={150}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </>
        ) : (
          <>
            {data ? (
              <>
                <div className="col-span-1 md:col-span-3">
                  <h2 className="mb-4 pb-2 border-[#22c55e] border-b-2 font-semibold text-xl">
                    Content
                  </h2>
                  <p className="text-justify">{data.content}</p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <h2 className="mb-4 pb-2 border-[#22c55e] border-b-2 font-semibold text-xl">
                    Summary
                  </h2>
                  <p className="text-justify">{data.summary}</p>
                </div>
              </>
            ) : (
              <div className="col-span-1 md:col-span-5 text-center">
                <p>Please insert the valid URL first!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
