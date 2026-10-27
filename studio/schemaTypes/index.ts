import { article } from "./documents/article";
import { manager } from "./documents/manager";
import { evCharge, mhp, plantStatus } from "./documents/mapAssets";
import { news } from "./documents/news";
import { plant } from "./documents/plant";
import { procurement } from "./documents/procurement";
import { vacancy } from "./documents/vacancy";
import { dataTable } from "./objects/dataTable";
import { imageBlock } from "./objects/imageBlock";
import { link, richText } from "./objects/richText";
import { seo } from "./objects/seo";
import { youtubeBlock } from "./objects/youtubeBlock";

export const schemaTypes = [
  // documents
  news,
  article,
  plant,
  vacancy,
  procurement,
  manager,
  plantStatus,
  evCharge,
  mhp,
  // objects
  richText,
  link,
  imageBlock,
  dataTable,
  youtubeBlock,
  seo,
];
