class CreateCrimeEntries < ActiveRecord::Migration
  def change
    create_table :crime_entries do |t|

      t.timestamps
    end
  end
end
