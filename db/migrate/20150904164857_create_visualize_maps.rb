class CreateVisualizeMaps < ActiveRecord::Migration
  def change
    create_table :visualize_maps do |t|

      t.timestamps
    end
  end
end
