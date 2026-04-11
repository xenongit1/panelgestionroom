export function AuthBrand() {
  return (
    <div className="mb-8 flex flex-col items-center gap-3">
      <img
        src="/logo-mark-dark.svg"
        alt="GestionRoom"
        className="h-14 w-14 sm:h-16 sm:w-16 object-contain"
      />
      <div className="flex flex-col items-center gap-1">
        <span className="text-[28px] sm:text-[30px] font-semibold tracking-[-0.03em] text-[#1A1A1A]">
          GestionRoom
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8F8F8F]">
          Panel de Control
        </span>
      </div>
    </div>
  );
}
