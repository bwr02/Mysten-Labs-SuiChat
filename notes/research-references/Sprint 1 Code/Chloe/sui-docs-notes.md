###  Sui 101

## Shared vs Owned Objects
Stored on chain, objects on Sui can be shared (accessible for reads and writes by any transaction) or owned (accessible for reads and writes by transactions signed by their owner).

Transactions that use owned objects:
* Benefit from low latency to finality (because they do not need to go through consensus)
* Complications when multiple parties come into play since only the owner of the object can access the object
  * Access to hot objects need to be coordinated off-chain

- expensve and stays forever, not optimal

Transactions that access one or more shared objects:
* Flexibility in allowing multiple addresses to access the same object
* Require consensus to sequence read and writes to those objects leading to:
* Higher gas costs
* Increased latency


## Using Events
Supports activity monitoring.

**Monitoring on-chain events:**

**Option 1:** Incorporate a ***custom indexer*** to take advantage of Sui's micro-data ingestion framework.
* Leverage a custom indexer to process checkpoint data that includes events that have been emitted

**Option 2:** ***Poll*** the Sui network on a schedule to query events.
* Poll the Sui network to query for events emitted. This approach typically includes a database to store the data retrieved from these calls.

### Custom Indexer
You can build custom indexers using the Sui micro-data ingestion framework.

Advantages of a custom indexer:
* Improves latency
* Allows pruning the data of your Sui Full node
* Provides efficient assemblage of checkpoint data



To create an indexer --> Subscribe to a checkpoint stream with full checkpoint content.
  * This stream can be one of the publicly available streams from Mysten Labs, one that you set up in your local environment, or a combination of the two.

