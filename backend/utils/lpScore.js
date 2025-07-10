import axios from "axios";
export async function getLPScore(address) {
  const { data } = await axios.get(`https://api.llama.fi/score/${address}`);
  return data.score || 0;
}