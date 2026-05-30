// Dark Water Sports — Supabase data layer
(function () {
  const URL = 'https://rudxcgzbyuyeldzokvui.supabase.co';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZHhjZ3pieXV5ZWxkem9rdnVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMTQ1NDAsImV4cCI6MjA5NTU5MDU0MH0.H_E9115w6LkK-S98gfV40fxrNC3b_onk4tNY71ZNIvE';

  const client = supabase.createClient(URL, KEY);

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── MAPPERS ──
  function toProduct(row) {
    return {
      id: row.id,
      name: row.name || '',
      brand: row.brand || '',
      brandLabel: row.brand_label || '',
      category: row.category || '',
      categoryLabel: row.category_label || '',
      price: row.price != null ? String(row.price) : '',
      callForPrice: row.call_for_price || false,
      quantity: row.quantity != null ? row.quantity : 1,
      imageUrl: row.image_url || '',
      badge: row.badge || '',
    };
  }

  function fromProduct(section, p) {
    const row = {
      section,
      name: p.name,
      brand: p.brand || '',
      brand_label: p.brandLabel || '',
      category: p.category || '',
      category_label: p.categoryLabel || '',
      call_for_price: !!p.callForPrice,
      quantity: parseInt(p.quantity) || 0,
      image_url: p.imageUrl || '',
      badge: p.badge || '',
    };
    if (!p.callForPrice && p.price !== '' && p.price != null) {
      row.price = parseFloat(p.price) || 0;
    }
    return row;
  }

  function toRaffle(row) {
    if (!row) return null;
    return {
      active: row.active || false,
      prizeName: row.prize_name || '',
      prizeDescription: row.prize_description || '',
      prizeValue: row.prize_value != null ? String(row.prize_value) : '',
      prizeImage: row.prize_image || '',
      ticketPrice: row.ticket_price != null ? String(row.ticket_price) : '',
      totalTickets: row.total_tickets != null ? String(row.total_tickets) : '',
      ticketsSold: row.tickets_sold || 0,
      drawingDate: row.drawing_date || '',
      paymentVenmo: row.payment_venmo || '',
      paymentPaypal: row.payment_paypal || '',
      paymentCashapp: row.payment_cashapp || '',
      paymentNote: row.payment_note || '',
    };
  }

  function toWinner(row) {
    return { id: row.id, name: row.name || '', prize: row.prize || '', date: row.date || '' };
  }

  // ── AUTH ──
  async function signIn(email, password) {
    const { error } = await client.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }

  async function signOut() {
    await client.auth.signOut();
  }

  async function getSession() {
    const { data } = await client.auth.getSession();
    return data.session;
  }

  // ── PRODUCTS ──
  async function getProducts(section) {
    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('section', section)
      .order('created_at');
    if (error) { console.error('getProducts:', error); return []; }
    return (data || []).map(toProduct);
  }

  async function upsertProduct(section, p) {
    const row = fromProduct(section, p);
    if (p.id) {
      const { error } = await client.from('products').update(row).eq('id', p.id);
      if (error) console.error('upsertProduct update:', error);
    } else {
      const { error } = await client.from('products').insert(row);
      if (error) console.error('upsertProduct insert:', error);
    }
  }

  async function deleteProduct(id) {
    const { error } = await client.from('products').delete().eq('id', id);
    if (error) console.error('deleteProduct:', error);
  }

  // ── RAFFLE ──
  async function getRaffle() {
    const { data, error } = await client.from('raffle').select('*').eq('id', 1).maybeSingle();
    if (error || !data) return null;
    return toRaffle(data);
  }

  async function saveRaffle(r) {
    const row = {
      id: 1,
      active: r.active,
      prize_name: r.prizeName || null,
      prize_description: r.prizeDescription || null,
      prize_value: r.prizeValue ? parseFloat(r.prizeValue) : null,
      prize_image: r.prizeImage || null,
      ticket_price: r.ticketPrice ? parseFloat(r.ticketPrice) : null,
      total_tickets: r.totalTickets ? parseInt(r.totalTickets) : null,
      tickets_sold: parseInt(r.ticketsSold) || 0,
      drawing_date: r.drawingDate || null,
      payment_venmo: r.paymentVenmo || null,
      payment_paypal: r.paymentPaypal || null,
      payment_cashapp: r.paymentCashapp || null,
      payment_note: r.paymentNote || null,
    };
    const { error } = await client.from('raffle').upsert(row);
    if (error) console.error('saveRaffle:', error);
  }

  // ── WINNERS ──
  async function getWinners() {
    const { data, error } = await client
      .from('raffle_winners')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(toWinner);
  }

  async function upsertWinner(w) {
    const isUUID = w.id && /^[0-9a-f]{8}-/.test(String(w.id));
    if (isUUID) {
      const { error } = await client.from('raffle_winners')
        .update({ name: w.name, prize: w.prize, date: w.date || null })
        .eq('id', w.id);
      if (error) console.error('upsertWinner update:', error);
    } else {
      const { error } = await client.from('raffle_winners')
        .insert({ name: w.name, prize: w.prize, date: w.date || null });
      if (error) console.error('upsertWinner insert:', error);
    }
  }

  async function deleteWinner(id) {
    const { error } = await client.from('raffle_winners').delete().eq('id', id);
    if (error) console.error('deleteWinner:', error);
  }

  // ── IMAGE UPLOAD ──
  async function uploadImage(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await client.storage
      .from('product-images')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(error.message);
    const { data: { publicUrl } } = client.storage
      .from('product-images')
      .getPublicUrl(data.path);
    return publicUrl;
  }

  window.DB = {
    escHtml,
    signIn, signOut, getSession,
    getProducts, upsertProduct, deleteProduct,
    getRaffle, saveRaffle,
    getWinners, upsertWinner, deleteWinner,
    uploadImage,
  };
})();
