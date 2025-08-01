'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ShopForWomen = dynamic(() => import('./ui/ShopForWomen'));
const ShopForMen = dynamic(() => import('./ui/ShopForMen'));
const ShopForKid = dynamic(() => import('./ui/ShopForKid'));

export default function ShopSectionsWrapper() {
  return (
    <React.Fragment>
      <ShopForWomen />
      <ShopForMen />
      <ShopForKid />
    </React.Fragment>
  );
}
