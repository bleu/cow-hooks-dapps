"use client";

export default function GlobalError({ error }: { error: Error }) {
  /* eslint-disable-next-line no-console */
  console.error(error);

  return (
    <html lang="en">
      <body>
        <h2>Something went wrong!</h2>
      </body>
    </html>
  );
}
