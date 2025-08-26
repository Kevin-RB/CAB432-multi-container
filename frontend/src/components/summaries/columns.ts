import type { ColumnDef } from "@tanstack/react-table";

export type ReceiptSummary = {
    id: string;
    storedAt: string;
    data:{
        fileInfo: {
            originalName: string;
            savedAs: string;
            filePath: string;
            mimeType: string;
            size: number;
            sizeInMB: string;
            uploadTime: string;
        }
        receiptData: {
            store_name: string;
            items: {
                item_name: string;
                quantity: number;
                price_per_unit: number;
                total: number;
            }[];
            subtotal: number;
        };
        processing: {
            duration: string;
            timestamp: string;
        };
        ocrResult: {
            status: string;
            text: string;
            timestamp: number;
        };
        storage: {
            receiptId: string;
            storedAt: string;
            viewUrl: string;
        };
    }
};

export const DUMMY_DATA: ReceiptSummary[] = [
    {
        id: "1",
        storedAt: "2025-08-26T13:45:03.403Z",
        data: {
            fileInfo: {
                originalName: "test.png",
                savedAs: "1756215903184-test.png",
                filePath: "/usr/src/app/uploads/1756215903184-test.png",
                mimeType: "image/png",
            size: 91271,
            sizeInMB: "0.09",
            uploadTime: "2025-08-26T13:45:03.186Z"
        },
        ocrResult: {
            status: "success",
            text: "@\n2596 Macarthur Chambers PH: 07 3648 4357\n259 Queen Street\nTAX INVOICE - ABN 88 000 014 675,\n\nDescription                                        $\nBanana Cavendish\n0.912 kg NET @ $4.50/kg                        4.10\nWW Chicken Breast Fillets Bulk RSPCA\nQty 2 @ $11.92 each                           23.84\nPork Mince 888g\nQty 2 @ $8.00 each                            16.08\n‘*#Mai son8MuseairfrshnrG&Elderflower 266m]          8.00\n‘#Glade Armthrpy Reed Diff Lav Sandal 8@m1        16.08\nF/C Salad Baby Spinach 2806                   4.00\nMission Cheesy Nachos Crn Chips230g              4.50\n4#F/F Floral Price Point 12.08                  12.08\nHelgas Sourdough Grain and Seed 7509             5.68\nWoolworths Eggs CageFree 12pk 760g\nQty 2 @ $5.98 each                            11.86\nDairyworks Cheese Slices Cheddar 5009            7.38\n#L$ Broad-Spectrum Probiotic 99pk             42.00\nWoolworths Cream Cheese Spd Lght 250g            2.68\nMandarin The Odd Bunch 1kg                     3.18\nWW Paprika Smoked 38g                          2.68\n‘Avocado Hass                                   1.58\n“Promotional Price\n\n19 SUBTOTAL                               $163.74\n\nTOTAL                                 $163.74",
            timestamp: 1756215903.401228
        },
        receiptData: {
            store_name: "woolworths",
            items: [
                {
                    item_name: "banana",
                    quantity: 2,
                    price_per_unit: 0.5,
                    total: 1
                },
                {
                    item_name: "apple",
                    quantity: 1,
                    price_per_unit: 0.8,
                    total: 0.8
                }
            ],
            subtotal: 200
        },
        processing: {
            duration: "2550",
            timestamp: "2025-08-26T13:45:03.403Z"
        },
        storage: {
            receiptId: "1756215903403",
            storedAt: "2025-08-26T13:45:03.403Z",
            viewUrl: "/api/v1/receipts/1756215903403"
        }
    }
    },
    {
        id: "2",
        storedAt: "2025-08-26T13:45:03.403Z",
        data: {
        fileInfo: {
            originalName: "test.png",
            savedAs: "1756215903184-test.png",
            filePath: "/usr/src/app/uploads/1756215903184-test.png",
            mimeType: "image/png",
            size: 91271,
            sizeInMB: "0.09",
            uploadTime: "2025-08-26T13:45:03.186Z"
        },
        ocrResult: {
            status: "success",
            text: "@\n2596 Macarthur Chambers PH: 07 3648 4357\n259 Queen Street\nTAX INVOICE - ABN 88 000 014 675,\n\nDescription                                        $\nBanana Cavendish\n0.912 kg NET @ $4.50/kg                        4.10\nWW Chicken Breast Fillets Bulk RSPCA\nQty 2 @ $11.92 each                           23.84\nPork Mince 888g\nQty 2 @ $8.00 each                            16.08\n‘*#Mai son8MuseairfrshnrG&Elderflower 266m]          8.00\n‘#Glade Armthrpy Reed Diff Lav Sandal 8@m1        16.08\nF/C Salad Baby Spinach 2806                   4.00\nMission Cheesy Nachos Crn Chips230g              4.50\n4#F/F Floral Price Point 12.08                  12.08\nHelgas Sourdough Grain and Seed 7509             5.68\nWoolworths Eggs CageFree 12pk 760g\nQty 2 @ $5.98 each                            11.86\nDairyworks Cheese Slices Cheddar 5009            7.38\n#L$ Broad-Spectrum Probiotic 99pk             42.00\nWoolworths Cream Cheese Spd Lght 250g            2.68\nMandarin The Odd Bunch 1kg                     3.18\nWW Paprika Smoked 38g                          2.68\n‘Avocado Hass                                   1.58\n“Promotional Price\n\n19 SUBTOTAL                               $163.74\n\nTOTAL                                 $163.74",
            timestamp: 1756215903.401228
        },
        receiptData: {
            store_name: "woolworths",
            items: [
                {
                    item_name: "banana",
                    quantity: 2,
                    price_per_unit: 0.5,
                    total: 1
                },
                {
                    item_name: "apple",
                    quantity: 1,
                    price_per_unit: 0.8,
                    total: 0.8
                }
            ],
            subtotal: 200
        },
        processing: {
            duration: "2550",
            timestamp: "2025-08-26T13:45:03.403Z"
        },
        storage: {
            receiptId: "1756215903403",
            storedAt: "2025-08-26T13:45:03.403Z",
            viewUrl: "/api/v1/receipts/1756215903403"
        }
    }
    },
]

export const columns: ColumnDef<ReceiptSummary>[] = [
  {
    accessorKey: "data.fileInfo.originalName",
    header: "Original Name",
  },
  {
    accessorKey: "data.receiptData.store_name",
    header: "Store Name",
  },
  {
    accessorKey: "data.receiptData.subtotal",
    header: "Subtotal",
  },
]