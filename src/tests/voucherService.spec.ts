import {jest} from "@jest/globals";
import voucherRepository from "repositories/voucherRepository";
import voucherService from "services/voucherService";


describe("Create Vouchers route", () => {
    it("Should create a voucher by calling the createVoucher function", async () => {
        const code = "abc3bora";
        const discount = Math.floor(Math.random()*100+1);

        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce(():any => {return null} );
        jest.spyOn(voucherRepository, "createVoucher").mockImplementationOnce(():any => {return null} );

        voucherService.createVoucher(code,discount);

        expect(voucherRepository.getVoucherByCode).toHaveBeenCalledTimes(1);


    });

    it("Should throw a conflict error when trying to create a voucher which id already exists", async () => {
        const code = "abc4bora";
        const discount = Math.floor(Math.random()*100+1);
        
        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce(():any => {return { code, discount}});    
        jest.spyOn(voucherRepository, "createVoucher").mockImplementationOnce(():any => {return null});  

        const promise = voucherService.createVoucher(code,discount);

        const error = {
        message:"Voucher already exist.",
        type:"conflict"
        };
        expect(promise).rejects.toEqual(error);
    });


})

describe("Apply Vouchers route", () => {
    it("Should use a voucher by calling the useVoucher function", async () => {
        const code = "abc5bora";
        const discount = Math.floor(Math.random()*100+1);
        const used = false;   
        const amount = Math.floor(Math.random()*1000+100);

        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce(():any => {return {code,discount,used}});
        jest.spyOn(voucherRepository, "useVoucher").mockImplementationOnce(():any => {return null}); 
    
        const value = await voucherService.applyVoucher(code,amount);
        
        expect(voucherRepository.getVoucherByCode).toHaveBeenCalled();
        expect(value.finalAmount).toEqual(amount - (amount*(discount/100)));


    });

    it("Should throw an conflict error when trying use a voucher that doesn't exists", async () => {
        const code = "abc6bora";
        const amount = Math.floor(Math.random()*1000+1);
    
        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce(():any => {return null});
        jest.spyOn(voucherRepository, "useVoucher").mockImplementationOnce(():any => {return null}) ;
    
        const promise = voucherService.applyVoucher(code,amount);
        
        const error = {
          message:"Voucher does not exist.",
          type:"conflict"
        };
        expect(promise).rejects.toEqual(error);
    });

    it("Should not be possible to use a voucher into an amount lower than 100", async () => {
        const code = "abc7bora";
        const discount = Math.floor(Math.random()*100+1);
        const used = false;   
        const amount = Math.floor(Math.random()*100-1);

        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce(():any => {return {code,discount,used}});
        jest.spyOn(voucherRepository, "useVoucher").mockImplementationOnce(():any => {return {applied: true}}); 
        
        const isAmountValid = voucherService.isAmountValidForDiscount(amount);

        const fakeVoucher = await voucherService.applyVoucher(code,amount);
        
        expect(fakeVoucher.applied).toBe(false);
        expect(isAmountValid).toBe(false);

    });

})
