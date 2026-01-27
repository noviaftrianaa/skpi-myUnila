import { type JenjangList } from "@/lib/services/executive";

export const JenjangListDisplay = ({
  jenjangList,
}: {
  jenjangList: JenjangList;
}) => {
  return (
    <ul className="m-0 space-y-1 text-xs">
      {Object.entries(jenjangList).map(([jenjang, jumlah]) => {
        const numJumlah = parseInt((jumlah as string) || "0", 10);
        if (numJumlah === 0) return null;
        return (
          <li key={jenjang} className="flex justify-between gap-4">
            <span>{jenjang}:</span>
            <span className="font-semibold">{numJumlah}</span>
          </li>
        );
      })}
    </ul>
  );
};
