import api from "./api";

export const livefeedService = {
  getFeeds: async () => {
    const res = await api.get("/livefeed");
    return res.data.feeds;
  },
  addFeed: async (feedData) => {
    const res = await api.post("/livefeed", feedData);
    return res.data.feed;
  },
  deleteFeed: async (id) => {
    const res = await api.delete(`/livefeed/${id}`);
    return res.data;
  }
};

export default livefeedService;
