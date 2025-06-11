const formatRupiah = (value?: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value || 0);
};

export default formatRupiah;
