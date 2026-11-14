import type { Manager } from "services/managers.service";

export type LeadershipPositionKey =
  | "ceo"
  | "cfo"
  | "headCorporateServices"
  | "headOperations"
  | "directorService"
  | "headHr"
  | "headCommercialOperations"
  | "headAccounting"
  | "headProcurementContracts"
  | "headItDigitalization"
  | "headInternationalCooperation"
  | "headEngineeringManagement";

export type LeadershipProfile = {
  id: string;
  name: string;
  positionKey: LeadershipPositionKey;
  email: string;
  image: string;
  queue: number;
  isFeatured?: boolean;
};

export type LeadershipMember = {
  id: string;
  name: string;
  jobTitle: string;
  email: string;
  image: string | null;
  queue: number;
  isFeatured: boolean;
};

export const leadershipTeam = [
  {
    id: "nodirbek-nasretdinov",
    name: "Nodirbek Nasretdinov",
    positionKey: "ceo",
    email: "nn@yashil-energiya.uz",
    image: "/images/leadership/nodirbek-nasretdinov.webp",
    queue: 1,
    isFeatured: true,
  },
  {
    id: "firuza-kabulova",
    name: "Firuza Kabulova",
    positionKey: "cfo",
    email: "f.kabulova@yashil-energiya.uz",
    image: "/images/leadership/firuza-kabulova.webp",
    queue: 2,
  },
  {
    id: "abduraximjon-yuldashev",
    name: "Abduraximjon Yuldashev",
    positionKey: "headCorporateServices",
    email: "a.yuldashev@yashil-energiya.uz",
    image: "/images/leadership/abduraximjon-yuldashev.webp",
    queue: 3,
  },
  {
    id: "evgenii-zhuravlev",
    name: "Evgenii Zhuravlev",
    positionKey: "headOperations",
    email: "e.zhuravlev@yashil-energiya.uz",
    image: "/images/leadership/evgenii-zhuravlev.webp",
    queue: 4,
  },
  {
    id: "komoliddin-baratov",
    name: "Komoliddin Baratov",
    positionKey: "directorService",
    email: "k.baratov@yashil-energiya.uz",
    image: "/images/leadership/komoliddin-baratov.webp",
    queue: 5,
  },
  {
    id: "dilshadbek-madaminov",
    name: "Dilshadbek Madaminov",
    positionKey: "headHr",
    email: "d.madaminov@yashil-energiya.uz",
    image: "/images/leadership/dilshadbek-madaminov.webp",
    queue: 6,
  },
  {
    id: "farxod-iminov",
    name: "Farxod Iminov",
    positionKey: "headCommercialOperations",
    email: "f.iminov@yashil-energiya.uz",
    image: "/images/leadership/farxod-iminov.webp",
    queue: 7,
  },
  {
    id: "zafar-madjidov",
    name: "Zafar Madjidov",
    positionKey: "headAccounting",
    email: "z.madjidov@yashil-energiya.uz",
    image: "/images/leadership/zafar-madjidov.webp",
    queue: 8,
  },
  {
    id: "muxammad-fayzullo-muxamedaliev",
    name: "Muxammad-Fayzullo Muxamedaliev",
    positionKey: "headProcurementContracts",
    email: "m.muxamedaliev@yashil-energiya.uz",
    image: "/images/leadership/muxammad-fayzullo-muxamedaliev.webp",
    queue: 9,
  },
  {
    id: "amir-ibragimov",
    name: "Amir Ibragimov",
    positionKey: "headItDigitalization",
    email: "a.ibragimov@yashil-energiya.uz",
    image: "/images/leadership/amir-ibragimov.webp",
    queue: 10,
  },
  {
    id: "shamshimuxamed-nuriyev",
    name: "Shamshimuxamed Nuriyev",
    positionKey: "headInternationalCooperation",
    email: "sh.nuriyev@yashil-energiya.uz",
    image: "/images/leadership/shamshimuxamed-nuriyev.webp",
    queue: 11,
  },
  {
    id: "shavkat-shamshutdinov",
    name: "Shavkat Shamshutdinov",
    positionKey: "headEngineeringManagement",
    email: "s.shamshutdinov@yashil-energiya.uz",
    image: "/images/leadership/shavkat-shamshutdinov.webp",
    queue: 12,
  },
] satisfies LeadershipProfile[];

const profileByEmail = new Map(
  leadershipTeam.map((profile) => [normalizeEmail(profile.email), profile]),
);

type GetPosition = (key: LeadershipPositionKey) => string;

export function resolveLeadershipMembers(
  managers: Manager[],
  getPosition: GetPosition,
  options?: { preferLocalPositions?: boolean },
) {
  const cmsMembers = managers.map((manager) => {
    const profile = profileByEmail.get(normalizeEmail(manager.email));
    const translatedPosition = profile
      ? getPosition(profile.positionKey)
      : manager.jobTitle;

    return {
      id: profile?.id ?? manager.id ?? slugFromName(manager.name),
      name: manager.name || profile?.name || manager.email,
      jobTitle:
        options?.preferLocalPositions || !manager.jobTitle
          ? translatedPosition
          : manager.jobTitle,
      email: manager.email,
      image: manager.photo?.url ?? profile?.image ?? null,
      queue: manager.queue ?? profile?.queue ?? leadershipTeam.length + 1,
      isFeatured: Boolean(profile?.isFeatured),
    } satisfies LeadershipMember;
  });

  // Only published CMS managers are shown: the local profiles above enrich
  // them by email but never add people, so unpublishing in Studio removes
  // the card from the site.
  const members = cmsMembers.sort((a, b) => a.queue - b.queue);

  if (members.some((member) => member.isFeatured)) {
    return members;
  }

  return members.map((member, index) => ({
    ...member,
    isFeatured: index === 0,
  }));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function slugFromName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
