module suiNS:suiNS_search {
    /// Import the SuiNS dependency.
    use suins::{ 
        suins::SuiNS,
        registry::Registry,
        domain
    };
    use sui::event;

    public struct SuiAddress has copy, drop{
        addressVal: address,
        recipient: address,
    }

    /// Different custom error messages.
    const ENameNotFound: u64 = 0;
    const ENameNotPointingToAddress: u64 = 1;
    const ENameExpired: u64 = 2;

    
 
    /// A function to find addres based on sui name
    public fun findAddress(suins: &SuiNS, name: String, currUser: address) {
        // Look up the name on the registry.
        let mut optional = suins.registry<Registry>().lookup(domain::new(name));
        // Check that the name indeed exists.
        assert!(optional.is_some(), ENameNotFound);
 
        let name_record = optional.extract();
        // Check that name has not expired. 
        // This check is optional, but it's recommended you perform the verification.
        assert!(!name_record.has_expired(clock), ENameExpired);
        // Check that the name has a target address set.
        assert!(name_record.target_address().is_some(), ENameNotPointingToAddress);
 
        // Transfer the object to that name.
        transfer::public_transfer(obj, name_record.target_address().extract())
        let address_event = SuiAddress { name_record.target_address().extract(), currUser, };
        
        event::emit(address_event);
    }

}