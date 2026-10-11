import { buttonClasses } from "@/components/ui/button";
import { site } from "@/lib/site";

export function PaymentInstructions({
  reference,
  payLink,
  checkoutUrl,
  amountLabel,
  showEft = true,
}: {
  reference?: string;
  payLink?: string | null;
  checkoutUrl?: string | null;
  amountLabel?: string;
  showEft?: boolean;
}) {
  const yocoUrl = checkoutUrl || payLink;

  return (
    <div className="space-y-4">
      {yocoUrl ? (
        <>
          <a
            href={yocoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className={buttonClasses("primary", "md", "w-full")}
          >
            {amountLabel ? `Pay ${amountLabel} with Yoco` : "Pay with Yoco"}
          </a>
          <p className="text-sm text-forest-900/70">
            {checkoutUrl
              ? `Card checkout is charged for ${amountLabel ?? "your ticket total"}`
              : "Pay the event total on this hike's Yoco link"}
            {reference ? (
              <>
                {" "}
                and use <strong className="text-forest-900">{reference}</strong> as
                the payment reference.
              </>
            ) : (
              ". You will get a booking reference after you confirm."
            )}
          </p>
        </>
      ) : null}
      {showEft ? (
        <div className="rounded-3xl bg-sand/70 p-5 text-sm text-forest-900/80">
          <p className="font-display text-base font-bold tracking-tight text-forest-900">
            {yocoUrl ? "Or pay by EFT" : "Pay by EFT"}
          </p>
          <p className="mt-2 leading-relaxed">
            {site.bank.accountName}
            <br />
            {site.bank.bank}
            <br />
            Account {site.bank.accountNumber}
            <br />
            Branch code {site.bank.branchCode}
            {reference ? (
              <>
                <br />
                <strong>Reference: {reference}</strong>
              </>
            ) : (
              <>
                <br />
                Use your booking reference once you confirm.
              </>
            )}
          </p>
        </div>
      ) : null}
    </div>
  );
}
