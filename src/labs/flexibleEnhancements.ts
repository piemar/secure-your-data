import type { Step } from '@/components/labs/LabViewWithTabs';

/**
 * Step enhancements for Flexible Schema labs.
 *
 * These are referenced from lab steps via `enhancementId`, e.g.
 *  - enhancementId: 'flexible.initial-collection'
 *
 * Each factory returns a Partial<Step> that will be merged into the UI
 * representation for that step (code blocks, tips, troubleshooting, etc).
 */

type StepEnhancementFactory = () => Partial<Step>;

export const flexibleEnhancements: Record<string, StepEnhancementFactory> = {
  'flexible.initial-collection': () => ({
    codeBlocks: [
      {
        filename: 'create-employees.py',
        language: 'python',
        code: `from pymongo import MongoClient
import random
from datetime import datetime

# Connect to MongoDB Atlas
client = MongoClient("YOUR_ATLAS_URI_STRING")
db = client["FLEXIBLE"]
collection = db["employees"]

# Sample employee data
employees = [
    {"name": "Alice Johnson", "email": "alice@example.com", "salary": 75000},
    {"name": "Bob Smith", "email": "bob@example.com", "salary": 85000},
    {"name": "Carol White", "email": "carol@example.com", "salary": 65000},
    {"name": "David Brown", "email": "david@example.com", "salary": 95000},
    {"name": "Eve Davis", "email": "eve@example.com", "salary": 70000},
]

# Insert employees
result = collection.insert_many(employees)
print(f"Inserted {len(result.inserted_ids)} employees")

# Verify insertion
count = collection.count_documents({})
print(f"Total employees in collection: {count}")`,
        skeleton: `from pymongo import MongoClient

# Connect to MongoDB Atlas
client = MongoClient("_________")
db = client["_________"]
collection = db["_________"]

# Create sample employee documents
employees = [
    {"name": "Alice Johnson", "email": "alice@example.com", "salary": _________},
    {"name": "Bob Smith", "email": "bob@example.com", "salary": 85000},
    # Add more employees...
]

# Insert employees into collection
result = collection._________()
print(f"Inserted {len(result.inserted_ids)} employees")`,
        inlineHints: [
          {
            line: 4,
            blankText: '_________',
            hint: 'Your MongoDB Atlas connection string',
            answer: 'YOUR_ATLAS_URI_STRING',
          },
          {
            line: 5,
            blankText: '_________',
            hint: 'Database name for this proof exercise',
            answer: 'FLEXIBLE',
          },
          {
            line: 6,
            blankText: '_________',
            hint: 'Collection name for employee records',
            answer: 'employees',
          },
          {
            line: 10,
            blankText: '_________',
            hint: 'Salary amount for Alice (numeric value)',
            answer: '75000',
          },
          {
            line: 16,
            blankText: '_________',
            hint: 'Method to insert multiple documents',
            answer: 'insert_many(employees)',
          },
        ],
      },
    ],
    tips: [
      'Use your actual Atlas connection string including username and password.',
      'The database name "FLEXIBLE" matches the proof exercise convention.',
      'Start with 5-10 employees for testing, then scale up if needed.',
    ],
  }),

  'flexible.add-fields': () => ({
    codeBlocks: [
      {
        filename: 'add-fields.py',
        language: 'python',
        code: `from pymongo import MongoClient
from datetime import datetime

client = MongoClient("YOUR_ATLAS_URI_STRING")
db = client["FLEXIBLE"]
collection = db["employees"]

# Add department field to some employees
result1 = collection.update_many(
    {"name": {"$in": ["Alice Johnson", "Bob Smith", "Carol White"]}},
    {"$set": {"department": "Engineering"}}
)
print(f"Added department to {result1.modified_count} employees")

# Add birth_date field to different employees
result2 = collection.update_many(
    {"name": {"$in": ["David Brown", "Eve Davis"]}},
    {"$set": {"birth_date": datetime(1990, 5, 15)}}
)
print(f"Added birth_date to {result2.modified_count} employees")

# Verify the updates
alice = collection.find_one({"name": "Alice Johnson"})
print(f"Alice's document: {alice}")`,
        skeleton: `from pymongo import MongoClient
from datetime import datetime

client = MongoClient("YOUR_ATLAS_URI_STRING")
db = client["FLEXIBLE"]
collection = db["employees"]

# Add department field using $set operator
result1 = collection._________(
    {"name": {"$in": ["Alice Johnson", "Bob Smith"]}},
    {"$set": {"department": "_________"}}
)

# Add birth_date field to different employees
result2 = collection.update_many(
    {"name": {"$in": ["David Brown", "Eve Davis"]}},
    {"$set": {"birth_date": datetime(1990, 5, 15)}}
)

# Verify updates
alice = collection.find_one({"name": "Alice Johnson"})
print(f"Alice's document: {alice}")`,
        inlineHints: [
          {
            line: 7,
            blankText: '_________',
            hint: 'Method to update multiple documents',
            answer: 'update_many',
          },
          {
            line: 9,
            blankText: '_________',
            hint: 'Department name (e.g., Engineering, Sales, Marketing)',
            answer: 'Engineering',
          },
        ],
      },
    ],
    tips: [
      'The $set operator adds or updates fields without overwriting the entire document.',
      'You can add fields to a subset of documents - MongoDB handles mixed schemas gracefully.',
      'Existing fields remain unchanged when using $set.',
    ],
  }),

  'flexible.mixed-queries': () => ({
    codeBlocks: [
      {
        filename: 'query-mixed-schema.py',
        language: 'python',
        code: `from pymongo import MongoClient

client = MongoClient("YOUR_ATLAS_URI_STRING")
db = client["FLEXIBLE"]
collection = db["employees"]

# Query all employees (with and without new fields)
all_employees = list(collection.find({}))
print(f"Total employees: {len(all_employees)}")

# Query only employees with department field
with_dept = list(collection.find({"department": {"$exists": True}}))
print(f"Employees with department: {len(with_dept)}")

# Query employees by birth_date (only those with the field)
born_1990 = list(collection.find({"birth_date": {"$gte": datetime(1990, 1, 1)}}))
print(f"Employees born in 1990+: {len(born_1990)}")

# Query employees without new fields
without_new_fields = list(collection.find({
    "department": {"$exists": False},
    "birth_date": {"$exists": False}
}))
print(f"Employees without new fields: {len(without_new_fields)}")`,
        skeleton: `from pymongo import MongoClient

client = MongoClient("YOUR_ATLAS_URI_STRING")
db = client["FLEXIBLE"]
collection = db["employees"]

# Query all employees
all_employees = list(collection._________({}))

# Query employees with department field
with_dept = list(collection.find({"department": {"$exists": _________}}))

# Query by birth_date range
born_1990 = list(collection.find({"birth_date": {"$gte": datetime(1990, 1, 1)}}))

# Query employees without new fields
without_new_fields = list(collection.find({
    "department": {"$exists": False},
    "birth_date": {"$exists": False}
}))`,
        inlineHints: [
          {
            line: 7,
            blankText: '_________',
            hint: 'Method to find documents',
            answer: 'find',
          },
          {
            line: 10,
            blankText: '_________',
            hint: 'Boolean value to check if field exists',
            answer: 'True',
          },
        ],
      },
    ],
    tips: [
      'MongoDB queries work seamlessly across documents with different schemas.',
      'Use $exists: True to find documents that have a specific field.',
      'Documents without queried fields are simply not returned (not an error).',
    ],
  }),

  'flexible.nested-subdoc': () => ({
    codeBlocks: [
      {
        filename: 'add-nested-documents.py',
        language: 'python',
        code: `from pymongo import MongoClient

client = MongoClient("YOUR_ATLAS_URI_STRING")
db = client["FLEXIBLE"]
collection = db["employees"]

# Add contact sub-document
result = collection.update_many(
    {"name": {"$in": ["Alice Johnson", "Bob Smith"]}},
    {"$set": {
        "contact": {
            "phone": "555-0100",
            "address": {
                "street": "123 Main St",
                "city": "New York",
                "state": "NY"
            },
            "emergencyContact": "John Doe"
        }
    }}
)
print(f"Added contact info to {result.modified_count} employees")

# Verify nested structure
alice = collection.find_one({"name": "Alice Johnson"})
print(f"Alice's contact: {alice.get('contact', {})}")`,
        skeleton: `from pymongo import MongoClient

client = MongoClient("YOUR_ATLAS_URI_STRING")
db = client["FLEXIBLE"]
collection = db["employees"]

# Add contact sub-document using $set
result = collection.update_many(
    {"name": {"$in": ["Alice Johnson", "Bob Smith"]}},
    {"$set": {
        "contact": {
            "phone": "555-0100",
            "address": {
                "street": "123 Main St",
                "city": "_________",
                "state": "NY"
            },
            "emergencyContact": "John Doe"
        }
    }}
)

# Query nested field using dot notation
alice = collection.find_one({"contact.city": "_________"})`,
        inlineHints: [
          {
            line: 13,
            blankText: '_________',
            hint: 'City name in the address',
            answer: 'New York',
          },
          {
            line: 22,
            blankText: '_________',
            hint: 'Same city name for querying',
            answer: 'New York',
          },
        ],
      },
    ],
    tips: [
      'Nested documents are stored as embedded objects in MongoDB.',
      'Use dot notation (contact.city) to query nested fields.',
      'You can add nested structures to existing documents without affecting other fields.',
    ],
  }),

  'flexible.add-arrays': () => ({
    codeBlocks: [
      {
        filename: 'add-arrays.py',
        language: 'python',
        code: `from pymongo import MongoClient

client = MongoClient("YOUR_ATLAS_URI_STRING")
db = client["FLEXIBLE"]
collection = db["employees"]

# Add hobbies array
result1 = collection.update_many(
    {"name": {"$in": ["Alice Johnson", "Carol White"]}},
    {"$set": {"hobbies": ["reading", "hiking", "photography"]}}
)

# Add skills array with different values
result2 = collection.update_many(
    {"name": "Bob Smith"},
    {"$set": {"skills": ["Python", "JavaScript", "MongoDB"]}}
)

# Query employees with specific hobby
hikers = list(collection.find({"hobbies": "hiking"}))
print(f"Employees who like hiking: {len(hikers)}")

# Query using $in operator
readers = list(collection.find({"hobbies": {"$in": ["reading", "writing"]}}))
print(f"Employees who read or write: {len(readers)}")`,
        skeleton: `from pymongo import MongoClient

client = MongoClient("YOUR_ATLAS_URI_STRING")
db = client["FLEXIBLE"]
collection = db["employees"]

# Add hobbies array
result1 = collection.update_many(
    {"name": {"$in": ["Alice Johnson", "Carol White"]}},
    {"$set": {"hobbies": ["reading", "_________", "photography"]}}
)

# Query employees with specific hobby
hikers = list(collection.find({"hobbies": "_________"}))

# Query using $in operator
readers = list(collection.find({"hobbies": {"$in": ["reading", "writing"]}}))`,
        inlineHints: [
          {
            line: 9,
            blankText: '_________',
            hint: 'Another hobby activity',
            answer: 'hiking',
          },
          {
            line: 13,
            blankText: '_________',
            hint: 'Hobby to search for',
            answer: 'hiking',
          },
        ],
      },
    ],
    tips: [
      'Arrays can have different lengths and contents per document.',
      'Query arrays directly: {"hobbies": "hiking"} finds documents where hobbies array contains "hiking".',
      'Use $in to find documents where array contains any of the specified values.',
    ],
  }),

  'flexible.nested-queries': () => ({
    codeBlocks: [
      {
        filename: 'query-nested-structures.py',
        language: 'python',
        code: `from pymongo import MongoClient

client = MongoClient("YOUR_ATLAS_URI_STRING")
db = client["FLEXIBLE"]
collection = db["employees"]

# Query by nested field using dot notation
ny_employees = list(collection.find({"contact.address.city": "New York"}))
print(f"Employees in New York: {len(ny_employees)}")

# Query arrays using $elemMatch
photographers = list(collection.find({"hobbies": {"$elemMatch": {"$eq": "photography"}}}))
print(f"Photographers: {len(photographers)}")

# Projection with nested fields
employee_summary = collection.find_one(
    {"name": "Alice Johnson"},
    {"name": 1, "contact.city": 1, "hobbies": 1}
)
print(f"Summary: {employee_summary}")

# Update nested field using dot notation
collection.update_one(
    {"name": "Alice Johnson"},
    {"$set": {"contact.phone": "555-9999"}}
)`,
        skeleton: `from pymongo import MongoClient

client = MongoClient("YOUR_ATLAS_URI_STRING")
db = client["FLEXIBLE"]
collection = db["employees"]

# Query by nested field using dot notation
ny_employees = list(collection.find({"contact.address.city": "_________"}))

# Query arrays
photographers = list(collection.find({"hobbies": "_________"}))

# Projection with nested fields
employee_summary = collection.find_one(
    {"name": "Alice Johnson"},
    {"name": 1, "contact.city": 1, "hobbies": 1}
)

# Update nested field
collection.update_one(
    {"name": "Alice Johnson"},
    {"$set": {"contact.phone": "555-9999"}}
)`,
        inlineHints: [
          {
            line: 7,
            blankText: '_________',
            hint: 'City name to search for',
            answer: 'New York',
          },
          {
            line: 10,
            blankText: '_________',
            hint: 'Array element to search for',
            answer: 'photography',
          },
        ],
      },
    ],
    tips: [
      'Use dot notation to query nested fields: "contact.address.city".',
      'Query arrays directly: {"hobbies": "photography"} finds documents containing that value.',
      'Projections work with nested fields: {"contact.city": 1} returns only that nested field.',
    ],
  }),

  'flexible.microservice-one': () => ({
    codeBlocks: [
      {
        filename: 'microservice_one.py',
        language: 'python',
        code: `from pymongo import MongoClient
import time

client = MongoClient("YOUR_ATLAS_URI_STRING")
db = client["FLEXIBLE"]
collection = db["employees"]

print("Microservice One: Reading original fields (name, email, salary)")
print("=" * 60)

while True:
    try:
        # Query all employees, only reading original fields
        employees = list(collection.find(
            {},
            {"name": 1, "email": 1, "salary": 1, "_id": 0}
        ))
        
        print(f"[{time.strftime('%H:%M:%S')}] Found {len(employees)} employees")
        for emp in employees[:3]:  # Show first 3
            name = emp.get('name', 'Unknown')
            salary = emp.get('salary', 0)
            print(f"  - {name}: {salary}")
        
        time.sleep(5)  # Check every 5 seconds
    except KeyboardInterrupt:
        print("\\nStopping microservice...")
        break
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(5)`,
        skeleton: `from pymongo import MongoClient
import time

client = MongoClient("YOUR_ATLAS_URI_STRING")
db = client["FLEXIBLE"]
collection = db["employees"]

print("Microservice One: Reading original fields")
print("=" * 60)

while True:
    try:
        # Query employees, only reading original fields
        employees = list(collection.find(
            {},
            {"name": 1, "email": 1, "salary": 1, "_id": 0}
        ))
        
        print(f"Found {len(employees)} employees")
        for emp in employees[:3]:
            name = emp.get('name', 'Unknown')
            salary = emp.get('salary', 0)
            print(f"  - {name}: {salary}")
        
        time.sleep(_________)
    except KeyboardInterrupt:
        break`,
        inlineHints: [
          {
            line: 20,
            blankText: '_________',
            hint: 'Number of seconds to wait between queries',
            answer: '5',
          },
        ],
      },
    ],
    tips: [
      'This microservice only reads fields it knows about (name, email, salary).',
      'It will continue working even after new fields are added to documents.',
      'Use projections to limit which fields are returned from the database.',
    ],
  }),

  'flexible.schema-evolution': () => ({
    codeBlocks: [
      {
        filename: 'alter_model.py',
        language: 'python',
        code: `from pymongo import MongoClient
from datetime import datetime
import random

client = MongoClient("YOUR_ATLAS_URI_STRING")
db = client["FLEXIBLE"]
collection = db["employees"]

# Add department field to some employees
departments = ["Engineering", "Sales", "Marketing", "HR"]
result1 = collection.update_many(
    {},
    {"$set": {"department": random.choice(departments)}}
)
print(f"Added department to {result1.modified_count} employees")

# Add birth_date to some employees
result2 = collection.update_many(
    {"name": {"$in": ["David Brown", "Eve Davis"]}},
    {"$set": {"birth_date": datetime(1990, random.randint(1, 12), random.randint(1, 28))}}
)
print(f"Added birth_date to {result2.modified_count} employees")

# Add hobbies array
hobbies_list = ["reading", "hiking", "photography", "cooking", "traveling"]
result3 = collection.update_many(
    {"name": {"$in": ["Alice Johnson", "Carol White"]}},
    {"$set": {"hobbies": random.sample(hobbies_list, 3)}}
)
print(f"Added hobbies to {result3.modified_count} employees")

# Add contact sub-document
result4 = collection.update_many(
    {"name": "Bob Smith"},
    {"$set": {
        "contact": {
            "phone": "555-0100",
            "address": {"street": "123 Main St", "city": "New York", "state": "NY"},
            "emergencyContact": "John Doe"
        }
    }}
)
print(f"Added contact info to {result4.modified_count} employees")

print("\\nSchema evolution complete! Microservice One should still be running...")`,
        skeleton: `from pymongo import MongoClient
from datetime import datetime

client = MongoClient("YOUR_ATLAS_URI_STRING")
db = client["FLEXIBLE"]
collection = db["employees"]

# Add department field
result1 = collection.update_many(
    {},
    {"$set": {"department": "_________"}}
)

# Add birth_date
result2 = collection.update_many(
    {"name": {"$in": ["David Brown", "Eve Davis"]}},
    {"$set": {"birth_date": datetime(1990, 5, 15)}}
)

# Add hobbies array
result3 = collection.update_many(
    {"name": {"$in": ["Alice Johnson", "Carol White"]}},
    {"$set": {"hobbies": ["reading", "hiking", "photography"]}}
)

# Add contact sub-document
result4 = collection.update_many(
    {"name": "Bob Smith"},
    {"$set": {"contact": {"phone": "555-0100", "city": "New York"}}}
)`,
        inlineHints: [
          {
            line: 8,
            blankText: '_________',
            hint: 'Department name (e.g., Engineering, Sales)',
            answer: 'Engineering',
          },
        ],
      },
    ],
    tips: [
      'Run this script while microservice_one.py is still running.',
      'The existing microservice will continue working because it only reads fields it knows about.',
      'This demonstrates zero-downtime schema evolution.',
    ],
  }),

  'flexible.microservice-two': () => ({
    codeBlocks: [
      {
        filename: 'microservice_two.py',
        language: 'python',
        code: `from pymongo import MongoClient
import time

client = MongoClient("YOUR_ATLAS_URI_STRING")
db = client["FLEXIBLE"]
collection = db["employees"]

print("Microservice Two: Reading new fields (department, hobbies, contact)")
print("=" * 60)

while True:
    try:
        # Query employees with new fields
        employees_with_dept = list(collection.find(
            {"department": {"$exists": True}},
            {"name": 1, "department": 1, "hobbies": 1, "contact.city": 1, "_id": 0}
        ))
        
        print(f"[{time.strftime('%H:%M:%S')}] Found {len(employees_with_dept)} employees with new fields")
        for emp in employees_with_dept[:3]:
            name = emp.get('name', 'Unknown')
            dept = emp.get('department', 'N/A')
            hobbies = emp.get('hobbies', [])
            city = emp.get('contact', {}).get('city', 'N/A') if emp.get('contact') else 'N/A'
            print(f"  - {name} ({dept}): hobbies={hobbies}, city={city}")
        
        time.sleep(5)
    except KeyboardInterrupt:
        print("\\nStopping microservice...")
        break
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(5)`,
        skeleton: `from pymongo import MongoClient
import time

client = MongoClient("YOUR_ATLAS_URI_STRING")
db = client["FLEXIBLE"]
collection = db["employees"]

print("Microservice Two: Reading new fields")
print("=" * 60)

while True:
    try:
        # Query employees with new fields
        employees = list(collection.find(
            {"department": {"$exists": _________}},
            {"name": 1, "department": 1, "hobbies": 1, "contact.city": 1, "_id": 0}
        ))
        
        print(f"Found {len(employees)} employees with new fields")
        for emp in employees[:3]:
            name = emp.get('name', 'Unknown')
            dept = emp.get('department', 'N/A')
            hobbies = emp.get('hobbies', [])
            print(f"  - {name} ({dept}): {hobbies}")
        
        time.sleep(5)
    except KeyboardInterrupt:
        break`,
        inlineHints: [
          {
            line: 12,
            blankText: '_________',
            hint: 'Boolean to check if field exists',
            answer: 'True',
          },
        ],
      },
    ],
    tips: [
      'This microservice uses the newly added fields (department, hobbies, contact).',
      'It handles documents that may not have these fields using .get() with defaults.',
      'Both microservices can run simultaneously, each reading the fields they need.',
    ],
  }),
};
