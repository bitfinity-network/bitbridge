"use client";
import { IcrcBridge } from "@bitfinity/js-client";
import { Foo } from "@bitfinity/widget";
export default function Page(): JSX.Element {
  console.log("icrcBridge", IcrcBridge);
  return (
    <main>
      <div>
        <Foo />{" "}
      </div>
    </main>
  );
}
