/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

const FormSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email(),
  phoneNumber: z.string().min(6),
  address: z.string(),
  gender: z.enum(["MALE", "FEMALE"]),
});

const defaultValues: z.infer<typeof FormSchema> = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  address: "",
  gender: "MALE",
};

export function InputForm({ id }: Readonly<{ id?: string }>) {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  const { setValue } = form;

  const { data: dataSelected } = api.employee.findOne.useQuery(
    { id: id === undefined ? 0 : parseInt(id, 10) },
    {
      enabled: !!id,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  );

  const mutationCreate = api.employee.create.useMutation({
    onSuccess: () => router.push("/employees"),
    onError: (error) => {
      toast({
        title: "Error message:",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{error.shape?.message}</code>
          </pre>
        ),
      });
    },
  });

  const mutationUpdate = api.employee.update.useMutation({
    onSuccess: () => router.push("/employees"),
    onError: (error) => {
      toast({
        title: "Error message:",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{error.shape?.message}</code>
          </pre>
        ),
      });
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    if (id) {
      return mutationUpdate.mutate({ ...data, id });
    }
    return mutationCreate.mutate(data);
  }

  useEffect(() => {
    if (dataSelected?.data) {
      const { data } = dataSelected;
      setValue("firstName", data.firstName);
      setValue("lastName", data.lastName);
      setValue("email", data.email);
      setValue("phoneNumber", data.phoneNumber);
      setValue("address", data.address);
      setValue("gender", data.gender);
    }
  }, [dataSelected, setValue]);

  return (
    <Form {...form}>
      <h2>{id ? `Update employee ${id}` : "Create a new employee"}</h2>
      <Separator />
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>This is your first name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>This is your last name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>This is your email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>This is your secret password.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Notify me about...</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="MALE" />
                    </FormControl>
                    <FormLabel className="font-normal">Male</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="FEMALE" />
                    </FormControl>
                    <FormLabel className="font-normal">Female</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us your address"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                You can type your address here freely
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
