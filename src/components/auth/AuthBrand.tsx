export function AuthBrand() {
  return (
    <div className="mb-6 sm:mb-8 flex flex-col items-center text-center">
      <img src="/logo-mark-dark.svg" alt="GestionRoom" className="h-18 w-18 sm:h-20 sm:w-20 object-contain" />

      <div className="mt-4 flex flex-col items-center">
        <span className="font-sans text-[34px] leading-none sm:text-[40px] font-semibold tracking-[-0.055em] text-[#111111]">
          GestionRoom
        </span>

        <span className="mt-2 text-[11px] sm:text-xs font-medium uppercase tracking-[0.24em] text-[#8A8A8A]">
          Panel de Control
        </span>
      </div>
    </div>
  );
}
