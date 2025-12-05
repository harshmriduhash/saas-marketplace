import { useEffect, useState } from 'react';
import { api } from '~/utils/api';
import Head from 'next/head';
import Link from 'next/link';

const AdminTransactions = () => {
  const { data: payments, isLoading } = api.admin.getPayments.useQuery();
  const { data: listings, isLoading: listingsLoading } = api.admin.getFeaturedListings.useQuery();

  if (isLoading || listingsLoading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Admin - Transactions</title>
      </Head>
      <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Admin Dashboard</h1>

        <h2>Recent Payments</h2>
        {payments && payments.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Payment ID</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Order ID</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Amount (₹)</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Listing</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{p.id.slice(0, 8)}</td>
                  <td style={{ padding: '10px' }}>{p.razorpayOrderId.slice(0, 12)}</td>
                  <td style={{ padding: '10px' }}>₹{(p.amount / 100).toFixed(2)}</td>
                  <td style={{ padding: '10px', fontWeight: p.status === 'captured' ? 'bold' : 'normal', color: p.status === 'captured' ? 'green' : 'orange' }}>
                    {p.status}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <Link href={`/listings/${p.listingId}`}>
                      <a style={{ color: '#0066cc', textDecoration: 'none' }}>View Listing</a>
                    </Link>
                  </td>
                  <td style={{ padding: '10px' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No payments yet.</p>
        )}

        <h2>Featured Listings</h2>
        {listings && listings.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Listing Name</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>User</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Featured Until</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l: any) => (
                <tr key={l.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{l.name}</td>
                  <td style={{ padding: '10px' }}>{l.userId.slice(0, 12)}</td>
                  <td style={{ padding: '10px' }}>
                    {l.featuredUntil ? new Date(l.featuredUntil).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <Link href={`/listings/${l.id}`}>
                      <a style={{ color: '#0066cc', textDecoration: 'none' }}>View</a>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No featured listings yet.</p>
        )}
      </div>
    </>
  );
};

export default AdminTransactions;
